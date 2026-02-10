const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'session',
    description: 'Check session status and diagnostics',
    category: 'Owner',
    usage: '',
    ownerOnly: true,
    async execute(message, args, client) {

        // You might want to use a config-based owner check here

        try {
            const sessionPath = path.join(process.env.HOME || process.env.USERPROFILE, '.xbot_session');
            const sessionExists = fs.existsSync(sessionPath);
            const sessionFiles = sessionExists ? fs.readdirSync(sessionPath) : [];

            let totalSize = 0;
            if (sessionExists) {
                const getDirSize = (dir) => {
                    const files = fs.readdirSync(dir);
                    for (const file of files) {
                        const filePath = path.join(dir, file);
                        const stats = fs.statSync(filePath);
                        if (stats.isDirectory()) getDirSize(filePath);
                        else totalSize += stats.size;
                    }
                };
                try { getDirSize(sessionPath); } catch (e) { }
            }

            const formatBytes = (bytes, decimals = 2) => {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const dm = decimals < 0 ? 0 : decimals;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
            };

            let response = ` *Session Diagnostics*\n\n`;
            response += ` *Status:* ${sessionExists && sessionFiles.length > 0 ? ' Active' : ' Missing'}\n`;
            response += ` *Local Path:* \`${sessionPath}\`\n`;
            response += ` *Files:* ${sessionFiles.length}\n`;
            response += ` *Total Size:* ${formatBytes(totalSize)}\n\n`;

            response += ` *Persistence Info:*\n`;
            response += `Your session is saved both locally and in MongoDB. This ensures that even if you move the bot folder or the container restarts, you won't need to scan again.\n\n`;

            response += `*Maintenance:*\n`;
            response += ` \`/session reset\` - Clear local cache (Use if bot hangs)`;

            if (args[0] === 'reset') {
                // We don't actually delete it here for safety, just instruct
                return message.reply(' To reset session, please stop the bot and run:\n`rm -rf ~/.xbot_session`');
            }

            await message.reply(response);

        } catch (error) {
            console.error('Session Diagnostic Error:', error);
            await message.reply(' Failed to retrieve session diagnostics.');
        }
    }
};
