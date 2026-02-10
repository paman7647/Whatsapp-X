const axios = require('axios');

module.exports = {
    name: 'currency',
    aliases: ['conv', 'convert'],
    description: 'Convert currency (e.g. /currency 10 USD EUR)',
    usage: '<amount> <from> <to>',
    async execute(message, args, client) {
        if (args.length < 3) {
            return message.reply('Usage: `/currency <amount> <from> <to>`\nExample: `/currency 10 USD EUR`');
        }

        const amount = parseFloat(args[0]);
        const from = args[1].toUpperCase();
        const to = args[2].toUpperCase();

        if (isNaN(amount)) return message.reply(' Invalid amount.');

        const statusMsg = await message.reply(' *Converting currency...*');

        try {
            const response = await axios.get(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
            const result = response.data.rates[to];

            await statusMsg.edit(` *Currency Conversion*\n\n${amount} ${from} = *${result} ${to}*`);
        } catch (error) {
            console.error('Currency Error:', error.response ? error.response.data : error.message);
            await statusMsg.edit(' Conversion failed. Check currency codes (e.g., USD, EUR, INR).');
        }
    }
};
