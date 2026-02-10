const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'weather',
    aliases: ['wttr', 'forecast'],
    description: 'Get weather forecast for a city',
    usage: '<city>',
    category: 'Utility',
    async execute(message, args, client) {
        try {
            const city = args.join(' ') || 'London';
            const url = `https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%w+%h+%m`;

            const statusMsg = await message.reply(` Checking weather for *${city}*...`);

            const config = {
                timeout: 5000,
                headers: { 'User-Agent': 'curl/7.64.1' } // Mimic curl to avoid blocks
            };

            const response = await axios.get(url, config);
            const data = response.data;

            const weatherText = `*Weather in ${city}*\n\n${data}\n\n_Powered by wttr.in_`;

            const visualUrl = `https://wttr.in/${encodeURIComponent(city)}.png`;
            try {
                const media = await MessageMedia.fromUrl(visualUrl, { unsafeMime: true });
                await message.reply(media, undefined, { caption: weatherText });
                await statusMsg.delete(true).catch(() => { });
            } catch (e) {
                // Fallback to text only if image fails
                await statusMsg.edit(weatherText);
            }

        } catch (error) {
            console.error('Weather command error:', error.message);
            const errorMessage = error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT'
                ? 'Weather service is currently unavailable. Try again later.'
                : 'Could not fetch weather. Please check the city name.';
            await message.reply(`⚠️ ${errorMessage}`);
        }
    }
};
