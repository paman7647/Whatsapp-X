const os = require('os');
const moment = require('moment');
const config = require('../../config/config');
const { MessageMedia } = require('whatsapp-web.js');
const path = require('path');

let cachedMedia = null;

module.exports = {
    name: 'alive',
    description: 'Check if bot is alive and see system stats',
    category: 'owner',
    ownerOnly: true,
    async execute(message, args, client) {
        console.log('Alive command execution started');
        try {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
            const ram = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;

            const waVersion = await client.getWWebVersion().catch(() => 'Unknown');

            const response = `✨ **WhatsApp-X is Active!** ✨\n\n` +
                `👤 **Creator:** Aman Kumar Pandey\n` +
                `⚡ **Status:** Running smoothly\n` +
                `🕒 **Uptime:** ${uptimeStr}\n\n` +
                `How can I help you today? 🚀\n\n` +
                `📟 *RAM:* ${ram}\n` +
                `💻 *OS:* ${os.type()} ${os.release()}\n` +
                `📡 *WA Version:* ${waVersion}\n` +
                `🤖 *Bot Version:* 1.0.0\n\n` +
                `🛡️ *PM Protection:* ${config.enablePMProtection ? '✅ ON' : '❌ OFF'}\n` +
                `⚡ *Mode:* Advanced Userbot`;

            if (!cachedMedia) {
                const imagePath = path.join(__dirname, '../../../X.png');
                cachedMedia = MessageMedia.fromFilePath(imagePath);
            }

            await client.sendMessage(message.remote, cachedMedia, { caption: response });
        } catch (error) {
            console.error('Alive Command Error:', error);
            // Fallback to simple reply if media fails
            try {
                const simpleUptime = process.uptime();
                await message.reply(` *Bot is Alive!*\n\n *Uptime:* ${Math.floor(simpleUptime / 60)}m\n *Error loading full stats:* ${error.message}`);
            } catch (e) {
                console.error('Critical failure in alive fallback:', e);
            }
        }
    }
};
