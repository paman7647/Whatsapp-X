const os = require('os');
const process = require('process');
const config = require('../../config/config');

module.exports = {
    name: 'sysinfo',
    category: 'System',
    description: 'Show system information',
    usage: '',
    async execute(message, args, client) {
        const uptime = process.uptime();
        const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const ramFree = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const ramUsed = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;

        const formatUptime = (s) => {
            const d = Math.floor(s / (3600 * 24));
            const h = Math.floor(s % (3600 * 24) / 3600);
            const m = Math.floor(s % 3600 / 60);
            const seconds = Math.floor(s % 60);
            return `${d}d ${h}h ${m}m ${seconds}s`;
        };

        const info = `
💻 *SYSTEM INFORMATION*

⏱️ *Uptime:* ${formatUptime(uptime)}
🧠 *RAM:* ${ramUsed.toFixed(2)}GB / ${ramTotal}GB
🐧 *OS:* ${os.type()} ${os.release()} (${os.arch()})
⚙️ *Node.js:* ${process.version}
🤖 *Bot Version:* ${config.version || '1.0.0'}
        `.trim();

        await message.reply(info);
    }
};
