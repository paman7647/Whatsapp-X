const { GroupConfig } = require('../../models');

module.exports = {
    name: 'mute',
    aliases: ['unmute'],
    description: 'Mute or unmute group notifications (Bot internal)',
    usage: '<on|off>',
    category: 'Group',
    async execute(message, args, client) {
        const chat = await message.getChat();
        if (!chat.isGroup) return message.reply(' This command only works in groups.');

        const senderId = message.author || message.from;
        const sender = chat.participants.find(p => p.id._serialized === senderId);
        if (!sender?.isAdmin) return message.reply(' Admins only.');

        const command = message.body.split(' ')[0].toLowerCase().slice(1);
        const action = args[0]?.toLowerCase() || (command === 'mute' ? 'on' : 'off');

        const isMuted = action === 'on' || action === 'mute';

        try {
            await GroupConfig.findOneAndUpdate(
                { groupId: chat.id._serialized },
                { isMuted: isMuted, updatedAt: new Date() },
                { upsert: true }
            );
            await message.reply(` Group commands/events are now *${isMuted ? 'MUTED' : 'UNMUTED'}* for this bot.`);
        } catch (error) {
            console.error('Mute Error:', error);
            await message.reply(' Failed to update mute status.');
        }
    }
};
