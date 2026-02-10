const { Client, LocalAuth, RemoteAuth, MessageMedia } = require('whatsapp-web.js');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs-extra');
const express = require('express');
const os = require('os');
const config = require('./config/config');
const logger = require('./utils/logger');
const connectDatabase = require('./config/database');
const { loadCommands, commandStats } = require('./handlers/commandHandler'); // [NEW] Import commandStats
const { runHealthCheck } = require('./utils/check');

// Run Environment Health Check
// Run Environment Health Check (Async Wrapper)
(async () => {
    await runHealthCheck();
    startApp();
})();

async function startApp() {
    // Determine login mode ONCE at startup
    const isPhoneMode = ['true', '1', 'yes'].includes((process.env.PHONE || '').toLowerCase());
    if (isPhoneMode) logger.info('📱 PHONE LOGIN MODE ENABLED');
    logger.info(`Starting with node version: ${process.version}`);

    // Global log capture for dashboard
    const logs = [];
    const originalLog = console.log;
    const originalError = console.error;

    const util = require('util');
    function captureLog(type, ...args) {
        let message = util.format(...args);
        const cleanMessage = message.replace(/\x1B\[[0-9;]*[mK]/g, '');
        const timestamp = new Date().toLocaleTimeString();
        logs.push(`[${timestamp}] ${cleanMessage}`);
        if (logs.length > 100) logs.shift();
    }

    console.log = (...args) => {
        if (args[0] && typeof args[0] === 'string' && (args[0].includes('▄') || args[0].includes('█'))) return;
        originalLog(...args);
        captureLog('INFO', ...args);

        let socketMsg = util.format(...args).replace(/\x1B\[[0-9;]*[mK]/g, '');
        if (global.io) global.io.emit('log', { type: 'INFO', message: socketMsg });
    };
    console.error = (...args) => {
        originalError(...args);
        captureLog('ERROR', ...args);
        let socketMsg = util.format(...args).replace(/\x1B\[[0-9;]*[mK]/g, '');
        if (global.io) global.io.emit('log', { type: 'ERROR', message: socketMsg });
    };

    // Clear terminal on startup
    console.clear();
    console.log('\x1b[36m%s\x1b[0m', `
╔════════════════════════════════════════╗
║      X-UserBot - WhatsApp Assistant    ║
╚════════════════════════════════════════╝
`);

    // Initialize Database and Server
    const app = express();
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));
    const port = process.env.PORT || 12005;
    const QRCode = require('qrcode');
    const http = require('http');
    const { Server } = require('socket.io');

    const server = http.createServer(app);
    const io = new Server(server);
    global.io = io; // Make io accessible globally for analytics

    // Shared state
    let currentPairingCode = null;
    let isAwaitingScan = false;
    let latestQR = null;
    let isInitialized = false;
    let initProgress = 10; // [NEW] Start at 10%

    // Start server immediately to satisfy Render's port check
    server.listen(port, () => {
        logger.info(`Dashboard active on port ${port}`);
        logger.info(`Open Dashboard: http://localhost:${port}`);
    });

    connectDatabase().then(async () => {
        // [NEW] Refresh config from DB
        await config.refresh();
        logger.info('Configuration loaded from Database.');
        let authStrategy;

        // AUTO-FORCE MongoDB persistence on Render/Cloud environments
        // Advanced Session Management: Use unique Client ID
        const clientId = process.env.SESSION_ID || 'x-userbot';
        const isCloudValue = process.env.RENDER || process.env.RAILWAY_STATIC_URL || process.env.DYNO;
        const hasMongo = !!process.env.MONGODB_URI;
        const storageType = process.env.SESSION_STORAGE_TYPE || (isCloudValue && hasMongo ? 'mongo' : 'local');

        if (storageType === 'mongo' && hasMongo) {
            const { MongoStore } = require('wwebjs-mongo');
            const store = new MongoStore({ mongoose: mongoose });
            authStrategy = new RemoteAuth({
                store: store,
                backupSyncIntervalMs: 60000,
                clientId: clientId
            });
            logger.info(`🛰️ CLOUD SESSION [${clientId}]: Loading/Saving to MongoDB...`);
        } else {
            const sessionPath = process.env.SESSION_PATH || path.join(process.env.HOME || process.env.USERPROFILE, '.xbot_session', clientId);
            fs.ensureDirSync(sessionPath);
            authStrategy = new LocalAuth({
                clientId: clientId,
                dataPath: sessionPath
            });
            logger.info(`ℹ️ LOCAL SESSION [${clientId}]: Using storage at ${sessionPath}`);
        }

        let authTimeout;

        const phoneNumber = (process.env.PHONE_NUMBER || config.phoneNumber || '').replace(/[^0-9]/g, '');

        const client = new Client({
            authStrategy: authStrategy,
            puppeteer: {
                headless: true,
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-software-rasterizer',
                    '--disable-extensions',
                    '--disable-infobars',
                    '--disable-notifications',
                    '--disable-features=site-per-process', // Memory optimization
                    '--js-flags="--max-old-space-size=512"' // Memory limit for JS
                ]
            }
        });

        global.whatsappClient = client;

        // Register Events
        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            try {
                const event = require(path.join(eventsPath, file));
                if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
                else client.on(event.name, (...args) => event.execute(...args, client));
            } catch (err) {
                logger.error(`Failed to load event file ${file}:`, err);
            }
        }

        // ===== EXTRA AUTH EVENT TRACKING =====
        client.on('loading_screen', (percent, message) => {
            initProgress = 20 + Math.floor(percent * 0.5);
            logger.info(`🔄 Synchronization: ${percent}% - ${message}`);
            if (global.io) global.io.emit('status_update', { status: 'starting', progress: initProgress });
        });

        client.on('remote_session_saved', () => {
            logger.success('✅ Cloud Session successfully synced to MongoDB.');
        });

        // ===== QR / PHONE PAIRING HANDLER =====
        let pairingDone = false;

        client.on('qr', async (qr) => {
            isAwaitingScan = true;
            latestQR = qr;
            if (authTimeout) clearTimeout(authTimeout);

            // ALWAYS show QR in terminal and save for dashboard (fallback or main mode)
            logger.info('QR Code received. Scan to connect.');

            // Optimize QR display for terminal (small)
            qrcode.generate(qr, { small: true });

            // Save for web dashboard
            try {
                await QRCode.toFile(path.join(__dirname, '../public/qr.png'), qr, {
                    margin: 4,
                    scale: 10,
                    color: { dark: '#000000', light: '#ffffff' }
                });
            } catch (err) { }
        });

        client.on('code', async (code) => {
            currentPairingCode = code;
            console.log('\n╔═════════════════════════════════╗');
            console.log('║   🔗 YOUR WHATSAPP PAIRING CODE  ║');
            console.log(`║          ${code}              ║`);
            console.log('╚═════════════════════════════════╝\n');
            logger.info('Go to WhatsApp > Linked Devices > Link with Phone Number');
            pairingDone = true;
        });

        client.on('authenticated', () => {
            isInitialized = true;
            isAwaitingScan = false;
            currentPairingCode = null;
            initProgress = 90;
            logger.success('✅ Authenticated! Synchronizing data...');
            if (authTimeout) clearTimeout(authTimeout);
        });

        client.on('auth_failure', (msg) => {
            logger.error('❌ Authentication failure:', msg);
            isAwaitingScan = true;
            pairingDone = false; // Allow re-pairing
        });

        client.on('disconnected', async (reason) => {
            logger.warn('⚠️ Disconnected. Reason:', reason);
            isInitialized = false;
            isAwaitingScan = true;
            pairingDone = false;
            latestQR = null;

            // If explicit logout or failure, we might need to restart strategy
            logger.info('Restarting WhatsApp session...');
            try {
                await client.initialize();
            } catch (e) {
                logger.error('Failed to restart client after disconnect:', e);
            }
        });

        client.on('ready', async () => {
            isInitialized = true;
            currentPairingCode = null;
            initProgress = 100;
            logger.success('🚀 X-UserBot is fully active!');
            loadCommands();
            try {
                const setup = require('./config/setup');
                await setup();
            } catch (e) { }
        });

        // ===== DASHBOARD API =====
        app.get('/health', (req, res) => res.status(200).json({ status: 'healthy', whatsapp: isInitialized ? 'connected' : 'starting' }));

        app.get('/api/status', (req, res) => {
            let status = 'offline';
            if (isInitialized) {
                status = 'online';
                initProgress = 100;
            }
            else if (currentPairingCode) { status = 'pairing'; initProgress = 70; }
            else if (isAwaitingScan) { status = 'scan_qr'; initProgress = 80; }
            else {
                status = 'starting';
                if (initProgress < 15) initProgress += 2; // Slow crawl during browser launch
            }

            // Calculate System Stats
            const uptime = process.uptime();
            const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;

            // USE PROCESS RAM instead of system RAM
            const processMem = process.memoryUsage();
            const usedMemMB = (processMem.rss / (1024 * 1024)).toFixed(1);
            const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(1);

            res.json({
                status,
                pairingCode: currentPairingCode,
                phoneMode: false,
                progress: initProgress,
                system: {
                    uptime: uptimeString,
                    ram: `${usedMemMB} MB / ${totalMem} GB`,
                    platform: os.platform()
                },
                session: {
                    id: clientId,
                    type: storageType
                }
            });
        });

        app.post('/api/logout', async (req, res) => {
            try {
                logger.warn(`🛑 Logout requested for session: ${clientId}`);
                await client.logout();
                res.json({ success: true, message: 'Logged out successfully' });
            } catch (err) {
                logger.error('Logout failed:', err);
                res.status(500).json({ error: 'Logout failed' });
            }
        });

        app.post('/api/pair', async (req, res) => {
            const { phone } = req.body;
            if (!phone) return res.status(400).json({ error: 'Phone number is required (e.g. 919876543210)' });
            if (!isAwaitingScan || !latestQR) {
                return res.status(400).json({ error: 'Bot is not ready yet. Wait for the QR state before pairing.' });
            }

            const cleanPhone = phone.replace(/[^0-9]/g, '');
            const requestWithRetry = async (retryCount = 0) => {
                try {
                    logger.info(`Dashboard requesting pairing for: ${cleanPhone.slice(0, 2)}xxxxxx${cleanPhone.slice(-2)} (Attempt ${retryCount + 1}/3)`);
                    await new Promise(resolve => setTimeout(resolve, 3000)); // Short delay
                    const code = await client.requestPairingCode(cleanPhone);
                    currentPairingCode = code;
                    pairingDone = true;
                    return code;
                } catch (err) {
                    logger.error(`Web pairing attempt ${retryCount + 1} failed:`, err.message || err);
                    if (retryCount < 2) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        return requestWithRetry(retryCount + 1);
                    }
                    throw err;
                }
            };

            try {
                const code = await requestWithRetry();
                res.json({ code });
            } catch (err) {
                res.status(500).json({ error: 'Pairing failed. Ensure the phone number is correct and includes country code.' });
            }
        });

        app.get('/api/logs', (req, res) => res.json({ logs }));
        app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

        // Socket.io Connection Handler
        io.on('connection', (socket) => {
            // Send initial state
            socket.emit('init', {
                logs,
                stats: require('./services/analytics').getStats(),
                pairingCode: currentPairingCode,
                status: isInitialized ? 'online' : (currentPairingCode ? 'pairing' : (isAwaitingScan ? 'scan_qr' : 'starting')),
                qr: latestQR
            });
        });

        // Periodic Status Emit
        setInterval(() => {
            const uptime = process.uptime();
            const processMem = process.memoryUsage();
            const usedMemMB = (processMem.rss / (1024 * 1024)).toFixed(1);
            const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(1);

            io.emit('status_update', {
                status: isInitialized ? 'online' : (currentPairingCode ? 'pairing' : (isAwaitingScan ? 'scan_qr' : 'starting')),
                system: {
                    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
                    ram: `${usedMemMB} MB / ${totalMem} GB`
                },
                pairingCode: currentPairingCode
            });
        }, 2000);

        logger.info('Launching WhatsApp Web session...');
        client.initialize();

        authTimeout = setTimeout(() => {
            if (!isInitialized) {
                logger.error('Startup timed out.');
                process.exit(1);
            }
        }, 600000);

    }).catch(err => {
        logger.error('Startup failed:', err);
    });
}

const gracefulShutdown = async (signal) => {
    logger.info(`Shutdown via ${signal}...`);
    if (global.whatsappClient) await global.whatsappClient.destroy();
    await mongoose.connection.close();
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (e) => logger.error('Unhandled Rejection:', e));
process.on('uncaughtException', (e) => logger.error('Uncaught Exception:', e));
