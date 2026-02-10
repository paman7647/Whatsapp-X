module.exports = {
    name: 'lovecalc',
    aliases: ['love', 'compatibility'],
    category: 'Fun',
    description: 'Calculate love percentage',
    usage: '@user or name',
    async execute(message, args, client) {
        if (args.length === 0 && !message.hasQuotedMsg) return message.reply('⚠️ Mention someone or type a name.');

        let target = args.join(' ');
        const mentions = await message.getMentions();
        if (mentions.length > 0) target = mentions[0].pushname || mentions[0].number;

        const sender = (await message.getContact()).pushname || 'You';
        const percentage = Math.floor(Math.random() * 101);

        let msg = `💘 *Love Calculator* 💘\n\n`;
        msg += `*${sender}* + *${target}* = *${percentage}%*\n\n`;

        if (percentage > 90) msg += "🔥 Perfect Match!";
        else if (percentage > 70) msg += "❤️ Great Couple!";
        else if (percentage > 40) msg += "🤔 Maybe...";
        else msg += "💔 Run away!";

        await message.reply(msg);
    }
};
