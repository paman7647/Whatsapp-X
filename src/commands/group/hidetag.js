module.exports = {
    name: 'hidetag',
    aliases: ['ht'],
    category: 'Group',
    description: 'Tag everyone without showing mentions',
    usage: '<message>',
    async execute(message, args, client) {
        const chat = await message.getChat();
        if (!chat.isGroup) return message.reply('❌ This command can only be used in groups.');

        // Admin check
        const authorId = message.author || message.from;
        const participant = chat.participants.find(p => p.id._serialized === authorId);
        if (!participant.isAdmin && !participant.isSuperAdmin) return message.reply('❌ Admin only.');

        const text = args.join(' ') || 'Attention!';
        let mentions = [];

        for (let participant of chat.participants) {
            mentions.push(participant.id._serialized);
        }

        await client.sendMessage(message.remote, text, { mentions });
    }
};
