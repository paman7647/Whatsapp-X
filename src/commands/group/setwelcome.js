const { GroupConfig } = require('../../models');

module.exports = {
    name: 'setwelcome',
    description: 'Set a custom welcome message for the group',
    usage: '<text> (Use @user and group as placeholders)',
    category: 'Group',
    async execute(message, args, client) {
        const chat = await message.getChat();
        if (!chat.isGroup) return message.reply(' This command only works in groups.');

        // Admin check
        const senderId = message.author || message.from;
        const sender = chat.participants.find(p => p.id._serialized === senderId);
        if (!sender?.isAdmin) return message.reply(' Admins only.');

        const text = args.join(' ');
        if (!text) return message.reply(' Please provide a message. Example: `/setwelcome Welcome @user to group!`');

        try {
            await GroupConfig.findOneAndUpdate(
                { groupId: chat.id._serialized },
                { welcomeMessage: text, updatedAt: new Date() },
                { upsert: true }
            );
            await message.reply(' Welcome message updated for this group.');
        } catch (error) {
            console.error('SetWelcome Error:', error);
            await message.reply(' Failed to update welcome message.');
        }
    }
};
