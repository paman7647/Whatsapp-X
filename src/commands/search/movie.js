const axios = require('axios');

module.exports = {
    name: 'movie',
    aliases: ['film', 'imdb'],
    category: 'Search',
    description: 'Search for movie information',
    usage: '<movie name>',
    async execute(message, args, client) {
        const query = args.join(' ');
        if (!query) return message.reply('⚠️ Usage: .movie <name>');

        try {
            // Using OMDb public API (requires key usually, but some mirrors exist or use a key)
            // Replace 'your_omdb_key' with process.env.OMDB_API_KEY
            // For now, we will try to use a free endpoint or mocked response structure if Key is missing
            const apiKey = process.env.OMDB_API_KEY || 'trilogy'; // 'trilogy' is a common free key often used in tutorials

            const res = await axios.get(`http://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${apiKey}`);
            const data = res.data;

            if (data.Response === 'False') return message.reply('❌ Movie not found.');

            const info = `
🎬 *${data.Title} (${data.Year})*

⭐ *Rating:* ${data.imdbRating}/10
⏱️ *Runtime:* ${data.Runtime}
🎭 *Genre:* ${data.Genre}
🎬 *Director:* ${data.Director}
📝 *Plot:* ${data.Plot}
🏆 *Awards:* ${data.Awards}
            `.trim();

            if (data.Poster && data.Poster !== 'N/A') {
                const { MessageMedia } = require('whatsapp-web.js');
                const media = await MessageMedia.fromUrl(data.Poster);
                await message.reply(media, undefined, { caption: info });
            } else {
                await message.reply(info);
            }

        } catch (error) {
            console.error('Movie command error:', error);
            await message.reply('❌ Error fetching movie info.');
        }
    }
};
