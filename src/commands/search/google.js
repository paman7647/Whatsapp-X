const googleIt = require('google-it'); // Needed dependency, or use custom scraper

module.exports = {
    name: 'google',
    aliases: ['find', 'web'],
    category: 'Search',
    description: 'Google search',
    usage: '<query>',
    async execute(message, args, client) {
        const query = args.join(' ');
        if (!query) return message.reply('⚠️ Usage: .google <query>');

        try {
            // If google-it is not installed, we might fallback to a simple message
            // But let's assume it is or can be installed.
            // If not, we can simple-scrape or use another APi.

            // To ensure stability if pkg is missing:
            let results;
            try {
                results = await googleIt({ 'query': query, limit: 5 });
            } catch (e) {
                return message.reply('❌ Google search failed (dependency issue).');
            }

            let msg = `🔍 *Google Search: ${query}*\n\n`;
            results.forEach(res => {
                msg += `*${res.title}*\n${res.link}\n${res.snippet || ''}\n\n`;
            });

            await message.reply(msg);

        } catch (error) {
            console.error('Google error:', error);
            await message.reply('❌ Search failed.');
        }
    }
};
