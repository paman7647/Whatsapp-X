const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'image',
    aliases: ['img', 'pic'],
    category: 'Search',
    description: 'Search for an image',
    usage: '<query>',
    async execute(message, args, client) {
        const query = args.join(' ');
        if (!query) return message.reply('⚠️ Usage: .image <query>');

        try {
            // Use a free image search API or scrape (e.g. Unsplash, Pexels, or Google Custom Search)
            // For stability without keys, Unsplash Source or Pexels is easier.
            // Or simpler: Google Image URL pattern if possible (usually hard).
            // Let's use a "random" image from Unsplash matching keyword.

            const url = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(query)}`;

            // Note: source.unsplash.com redirects to the actual image. 
            // MessageMedia.fromUrl handles redirects nicely.

            // However, source.unsplash.com is deprecated/limited.
            // Better to use a reliable public API like Pollinations.ai for generated images or specific search API.
            // Let's use Pollinations for "valid" image generation based on prompt which acts like search.

            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`;

            const media = await MessageMedia.fromUrl(imageUrl);
            await message.reply(media, undefined, { caption: `🖼️ Image for: *${query}*` });

        } catch (error) {
            console.error('Image search error:', error);
            await message.reply('❌ Failed to fetch image.');
        }
    }
};
