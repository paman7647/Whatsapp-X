const os = require('os');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'stats',
    aliases: ['status', 'system'],
    category: 'Utility',
    description: 'Displays advanced system statistics and bot health.',
    usage: 'stats',
    execute: async (message, args, client) => {
        const uptime = process.uptime();
        const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

        const totalMem = os.totalmem() / (1024 ** 3);
        const freeMem = os.freemem() / (1024 ** 3);
        const usedMem = totalMem - freeMem;
        const memUsagePercent = (usedMem / totalMem) * 100;

        // Text-based progress bar for RAM
        const barLength = 10;
        const filledLength = Math.round((barLength * memUsagePercent) / 100);
        const emptyLength = barLength - filledLength;
        const progressBar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);

        const statsText = `
╔════════════════════════╗
║ 📊 *SYSTEM STATUS* 📊
╠════════════════════════╣
║
║ 🤖 *Bot Platform:* ${os.platform()} (${os.arch()})
║ ⏳ *Uptime:* ${uptimeString}
║ 🧠 *RAM Usage:*
║ [${progressBar}] ${memUsagePercent.toFixed(1)}%
║ (${usedMem.toFixed(2)} GB / ${totalMem.toFixed(2)} GB)
║
║ 📅 *Node Version:* ${process.version}
║ ⚡ *PID:* ${process.pid}
║
╚════════════════════════╝
        `.trim();

        await message.reply(statsText);
    }
};
