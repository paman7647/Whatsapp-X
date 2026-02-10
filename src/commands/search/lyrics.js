const lyricsFinder = require('lyrics-finder');

module.exports = {
    name: 'lyrics',
    category: 'Search',
    description: 'Get song lyrics',
    usage: '<song name>',
    async execute(message, args, client) {
        const query = args.join(' ');
        if (!query) return message.reply('⚠️ Usage: .lyrics <song name>');

        try {
            const lyrics = await lyricsFinder("", query) || "Not Found!";

            if (lyrics === "Not Found!" || !lyrics) {
                return message.reply('❌ Lyrics not found.');
            }

            await message.reply(`🎵 *Lyrics: ${query}*\n\n${lyrics}`);

        } catch (error) {
            console.error('Lyrics error:', error);
            await message.reply('❌ Failed to fetch lyrics.');
        }
    }
};
