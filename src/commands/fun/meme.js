const axios = require('axios');

module.exports = {
    name: 'meme',
    category: 'Fun',
    description: 'Get a random meme',
    usage: '',
    async execute(message, args, client) {
        try {
            const { MessageMedia } = require('whatsapp-web.js');
            const res = await axios.get('https://meme-api.com/gimme');
            const { url, title, subreddit } = res.data;

            if (!url) return message.reply('❌ No meme found.');

            const media = await MessageMedia.fromUrl(url);
            await message.reply(media, undefined, { caption: `😂 *${title}*\nAddict: r/${subreddit}` });

        } catch (error) {
            console.error('Meme error:', error);
            await message.reply('❌ Failed to fetch meme.');
        }
    }
};
