const fs = require('fs');
const path = require('path');
const config = require('../../config/config');

module.exports = {
    name: 'clearcache',
    aliases: ['cleartemp', 'purgecache'],
    description: 'Deletes all files in the temp directory',
    category: 'System',
    ownerOnly: true,
    async execute(message, args, client) {
        const tempDir = path.join(__dirname, '../../../temp');

        try {
            if (!fs.existsSync(tempDir)) {
                return message.reply(' Temp directory does not exist.');
            }

            const files = fs.readdirSync(tempDir);
            if (files.length === 0) {
                return message.reply(' Cache is already empty.');
            }

            let deletedCount = 0;
            for (const file of files) {
                // Optional: Skip .gitkeep if exists
                if (file === '.gitkeep') continue;

                fs.unlinkSync(path.join(tempDir, file));
                deletedCount++;
            }

            await message.reply(` *Cache Cleared!* Removed ${deletedCount} files.`);

        } catch (error) {
            console.error(error);
            message.reply(' Failed to clear cache.');
        }
    }
};
