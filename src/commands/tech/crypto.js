const axios = require('axios');

module.exports = {
    name: 'crypto',
    description: 'Get real-time cryptocurrency prices',
    usage: '<coin_id> (e.g., bitcoin, ethereum)',
    category: 'Tech',
    aliases: ['coin', 'price'],
    async execute(message, args) {
        if (!args[0]) return message.reply('Please provide a coin ID. Example: `.crypto bitcoin`');

        const coinId = args[0].toLowerCase();
        try {
            const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd,inr&include_24hr_change=true`);

            return message.reply(`❌ Coin \`${coinId}\` not found. Try \`.crypto bitcoin\`.`);

            const data = response.data[coinId];
            const priceUSD = data.usd;
            const priceINR = data.inr;
            const change24h = data.usd_24h_change ? data.usd_24h_change.toFixed(2) : 'N/A';

            const reply = `
💰 *${coinId.toUpperCase()} Price*

💵 *USD:* $${priceUSD}
₹ *INR:* ₹${priceINR}
Running change (24h): ${change24h}%
            `.trim();

            await message.reply(reply);

        } catch (error) {
            console.error('Crypto API Error:', error);
            await message.reply('❌ Failed to fetch crypto data. API might be down.');
        }
    }
};
