const translate = require('translate-google');

module.exports = {
    name: 'translate',
    aliases: ['tr'],
    description: 'Translate text to English',
    usage: '[lang] <text>',
    async execute(message, args, client) {
        let text;
        let targetLang = 'en';

        // Check if reply
        if (message.hasQuotedMsg) {
            const quotedMsg = await message.getQuotedMessage();
            text = quotedMsg.body;
            // If args provided, use first arg as lang
            if (args.length > 0) targetLang = args[0];
        } else {
            if (args.length === 0) return message.reply('Please provide text or reply to a message.');

            // Check if first arg is a lang code (len 2)
            if (args[0].length === 2) {
                targetLang = args[0];
                text = args.slice(1).join(' ');
            } else {
                text = args.join(' ');
            }
        }

        if (!text) return message.reply(' No text found to translate.');

        const statusMsg = await message.reply(' *Translating...*');

        try {
            const res = await translate(text, { to: targetLang });
            await statusMsg.edit(`*Translation (${targetLang}):*\n\n${res}`);
        } catch (error) {
            console.error(error);
            await statusMsg.edit(' Translation failed.');
        }
    }
};
