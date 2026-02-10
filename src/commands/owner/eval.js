const config = require('../../config/config');
const util = require('util');

module.exports = {
    name: 'eval',
    aliases: ['ev', 'e'],
    category: 'Owner',
    description: 'Evaluate JavaScript code',
    usage: '<code>',
    async execute(message, args, client) {
        const senderId = message.author || message.from;
        const normalize = (id) => id.replace('@c.us', '').replace('@s.whatsapp.net', '');

        // Owner check
        if (normalize(senderId) !== normalize(config.ownerId)) {
            return message.reply('❌ Owner only.');
        }

        const code = args.join(' ');
        if (!code) return message.reply('⚠️ Provide code to evaluate.');

        try {
            let evaled = await eval(code);

            if (typeof evaled !== 'string') {
                evaled = util.inspect(evaled);
            }

            message.reply(`✅ Result:\n\`\`\`js\n${evaled}\n\`\`\``);
        } catch (err) {
            message.reply(`❌ Error:\n\`\`\`js\n${err}\n\`\`\``);
        }
    }
};
