module.exports = {
    name: 'tagall',
    aliases: ['everyone', 'mentionall'],
    category: 'Group',
    description: 'Tag everyone in the group',
    usage: '<message>',
    async execute(message, args, client) {
        const chat = await message.getChat();
        if (!chat.isGroup) return message.reply('❌ This command can only be used in groups.');

        // Admin check (optional, but good practice)
        // const authorId = message.author || message.from;
        // const participant = chat.participants.find(p => p.id._serialized === authorId);
        // if (!participant.isAdmin) return message.reply('❌ Admin only.');

        let text = args.join(' ') || 'Hello everyone!';
        let mentions = [];

        for (let participant of chat.participants) {
            mentions.push(participant.id._serialized);
            // text += `@${participant.id.user} `; // Optional: explicit mentions in text
        }

        // Send with mentions
        await chat.sendMessage(`📣 *Tag All*\n\n${text}`, { mentions });
    }
};
