const wiki = require('wikijs').default;

module.exports = {
    name: 'wiki',
    aliases: ['wikipedia'],
    description: 'Search Wikipedia',
    async execute(message, args, client) {
        if (args.length === 0) return message.reply('Please provide a search term.');

        const query = args.join(' ');

        const statusMsg = await message.reply(` *Searching Wikipedia for "${query}"...*`);

        try {
            let page;
            try {
                page = await wiki().page(query);
            } catch (pageError) {
                // If direct page fails, try searching
                const searchResults = await wiki().search(query);
                if (searchResults.results && searchResults.results.length > 0) {
                    page = await wiki().page(searchResults.results[0]);
                } else {
                    throw new Error('No results');
                }
            }

            const summary = await page.summary();
            const intro = summary.split('\n')[0].substring(0, 500);
            const image = await page.mainImage();

            let response = `* Wikipedia: ${page.raw.title}*\n\n${intro}...\n\n ${page.raw.fullurl}`;

            if (image) {
                const { MessageMedia } = require('whatsapp-web.js');
                try {
                    const media = await MessageMedia.fromUrl(image);
                    await message.reply(media, undefined, { caption: response });
                    await statusMsg.delete(true).catch(() => { });
                } catch (e) {
                    // Fallback to text if image fails to load
                    await statusMsg.edit(response);
                }
            } else {
                await statusMsg.edit(response);
            }

        } catch (error) {
            await statusMsg.edit(` No results found for "${query}" on Wikipedia.`);
        }
    }
};
