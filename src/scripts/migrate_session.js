require('dotenv').config();
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');
const logger = require('../utils/logger');

async function migrate() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║    SESSION TO CLOUD MIGRATOR (V4)      ║');
    console.log('╚════════════════════════════════════════╝\n');

    if (!process.env.MONGODB_URI) {
        logger.error('MONGODB_URI is missing in .env');
        process.exit(1);
    }

    const clientId = process.env.SESSION_ID || 'x-userbot';

    try {
        logger.info('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        logger.success('Database connected.');

        const store = new MongoStore({ mongoose: mongoose });

        logger.info(`Starting interactive sync for [${clientId}]...`);
        logger.info('If you are already logged in locally, I will detect it.');
        logger.info('Otherwise, I will show a QR code. PLEASE SCAN IT.');

        const client = new Client({
            authStrategy: new RemoteAuth({
                store: store,
                clientId: clientId,
                backupSyncIntervalMs: 60000
            }),
            puppeteer: {
                headless: true, // Keep headless for terminal use
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        client.on('qr', (qr) => {
            logger.warn('--- ACTION REQUIRED ---');
            logger.info('No active session found. Please scan this QR code to log in:');
            qrcode.generate(qr, { small: true });
        });

        client.on('authenticated', () => {
            logger.success('✅ Authenticated successfully!');
        });

        client.on('ready', () => {
            logger.success('🚀 Bot is Ready!');
            logger.info('Uploading session state to MongoDB...');

            // Wait for RemoteAuth to trigger its initial backup
            setTimeout(async () => {
                logger.success('✨ CLOUD SYNC COMPLETE!');
                logger.info('Your session is now stored in MongoDB.');
                logger.info('You can now deploy to Render and it will start directly.');
                await client.destroy();
                await mongoose.disconnect();
                process.exit(0);
            }, 15000);
        });

        client.on('auth_failure', (msg) => {
            logger.error('Auth failure:', msg);
            process.exit(1);
        });

        client.initialize();

    } catch (err) {
        logger.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
