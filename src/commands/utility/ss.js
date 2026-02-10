const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'ss',
    aliases: ['screenshot', 'snap'],
    category: 'Utility',
    description: 'Take a screenshot of a website',
    usage: '<url>',
    async execute(message, args, client) {
        const url = args[0];
        if (!url) return message.reply('⚠️ Usage: .ss <url>');

        try {
            // Using a public screenshot API (e.g. screenshotapi.net, or api.screenshotmachine.com)
            // Or a free one like 'https://image.thum.io/get/width/1200/<url>'

            const screenshotUrl = `https://image.thum.io/get/width/1200/crop/800/${url}`;

            const media = await MessageMedia.fromUrl(screenshotUrl);
            await message.reply(media, undefined, { caption: `📸 Screenshot: ${url}` });

        } catch (error) {
            console.error('SS error:', error);
            await message.reply('❌ Failed to capture screenshot.');
        }
    }
};
