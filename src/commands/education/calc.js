const math = require('mathjs');

module.exports = {
    name: 'calc',
    aliases: ['calculate', 'math'],
    description: 'Solve math expressions',
    usage: '<expression>',
    async execute(message, args, client) {
        if (args.length === 0) return message.reply('Please provide a math expression.');

        const expression = args.join(' ');

        const statusMsg = await message.reply(' *Calculating...*');

        try {
            const result = math.evaluate(expression);
            await statusMsg.edit(` *Result:*\n${expression} = *${result}*`);
        } catch (error) {
            await statusMsg.edit(' Invalid expression.');
        }
    }
};
