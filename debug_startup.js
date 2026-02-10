const logger = require('./src/utils/logger');
console.log('--- DEBUG START ---');
try {
    const { Client, LocalAuth } = require('whatsapp-web.js');
    console.log('whatsapp-web.js loaded');
    const client = new Client({
        authStrategy: new LocalAuth({ dataPath: './.debug_session' }),
        puppeteer: { headless: true }
    });
    console.log('Client initialized');
    client.on('qr', (qr) => console.log('QR RECEIVED:', qr));
    client.initialize().then(() => console.log('Initialize started'));
} catch (e) {
    console.error('FAILED:', e);
}
