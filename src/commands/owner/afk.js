const { User } = require('../../models');

module.exports = {
    name: 'afk',
    description: 'Set AFK status when you are away',
    usage: '[reason]',
    category: 'Owner',
    ownerOnly: true,
    async execute(message, args, client) {
        const myId = client.info.wid._serialized;
        const reason = args.join(' ') || 'I am busy right now.';

        try {
            let user = await User.findOne({ whatsappId: myId });
            if (!user) {
                user = new User({ whatsappId: myId });
            }

            user.afk = {
                isAfk: true,
                reason: reason,
                since: new Date()
            };
            await user.save();

            await message.reply(` *AFK mode enabled.*\n*Reason:* ${reason}`);
        } catch (error) {
            console.error('AFK Error:', error);
            await message.reply(' Failed to set AFK status.');
        }
    }
};
