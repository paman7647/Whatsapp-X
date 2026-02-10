module.exports = {
    name: 'ship',
    category: 'Fun',
    description: 'Ship two people together',
    usage: '@user1 @user2',
    async execute(message, args, client) {
        const mentions = await message.getMentions();

        let p1 = 'You';
        let p2 = 'Someone';

        if (mentions.length === 2) {
            p1 = mentions[0].pushname || mentions[0].number;
            p2 = mentions[1].pushname || mentions[1].number;
        } else if (mentions.length === 1) {
            p1 = (await message.getContact()).pushname || 'You';
            p2 = mentions[0].pushname || mentions[0].number;
        } else {
            return message.reply('⚠️ Please mention two people to ship.');
        }

        const percentage = Math.floor(Math.random() * 101);

        // Generate ship name (basic)
        const shipName = p1.substring(0, p1.length / 2) + p2.substring(p2.length / 2);

        await message.reply(`🚢 *Shipping Alert!*\n\n👩‍❤️‍💋‍👨 ${p1} x ${p2}\n❤️ ${percentage}%\n📛 Ship Name: *${shipName}*`);
    }
};
