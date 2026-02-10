const { exec } = require('child_process');
const config = require('../../config/config');

module.exports = {
    name: 'exec',
    category: 'Owner',
    description: 'Execute shell commands',
    usage: '<command>',
    async execute(message, args, client) {
        const senderId = message.author || message.from;
        const normalize = (id) => id.replace('@c.us', '').replace('@s.whatsapp.net', '');

        // Owner check
        if (normalize(senderId) !== normalize(config.ownerId)) {
            return message.reply('❌ Owner only.');
        }

        const command = args.join(' ');
        if (!command) return message.reply('⚠️ Provide a command to execute.');

        exec(command, (error, stdout, stderr) => {
            if (error) {
                return message.reply(`❌ Error:\n\`\`\`${error.message}\`\`\``);
            }
            if (stderr) {
                return message.reply(`⚠️ Stderr:\n\`\`\`${stderr}\`\`\``);
            }
            message.reply(`✅ Output:\n\`\`\`${stdout}\`\`\``);
        });
    }
};
