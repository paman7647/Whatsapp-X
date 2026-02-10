const { exec } = require('child_process');
const path = require('path');

module.exports = {
    name: 'update',
    category: 'System',
    description: 'Update the bot from the git repository',
    ownerOnly: true,
    async execute(message, args, client) {
        await message.reply('🔄 Checking for updates...');

        exec('git pull', (error, stdout, stderr) => {
            if (error) {
                return message.reply(`❌ Error: ${error.message}`);
            }

            if (stdout.includes('Already up to date')) {
                return message.reply('✅ Bot is already up to date!');
            }

            message.reply(`✅ Update successful!\n\n${stdout}\n\n🔄 Restarting...`);

            // Restart using the script
            const restartScript = path.join(__dirname, '../../../restart.sh');
            exec(`sh ${restartScript}`, { detached: true, stdio: 'ignore' }).unref();

            // Allow time for the script to kill this process
        });
    }
};
