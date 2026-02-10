const config = require('../../config/config');

module.exports = {
    name: 'broadcast',
    aliases: ['bc'],
    category: 'Owner',
    description: 'Broadcast a message to all groups',
    usage: '<message>',
    async execute(message, args, client) {
        const senderId = message.author || message.from;
        const normalize = (id) => id.replace('@c.us', '').replace('@s.whatsapp.net', '');

        // Owner check
        if (normalize(senderId) !== normalize(config.ownerId)) {
            return message.reply('❌ Owner only command.');
        }

        const text = args.join(' ');
        if (!text && !message.hasMedia) return message.reply('⚠️ Provide a message to broadcast.');

        const chats = await client.getChats();
        const groups = chats.filter(c => c.isGroup);

        let sent = 0;
        await message.reply(`📣 Sending broadcast to ${groups.length} groups...`);

        // Check for attached media/quoted media
        const options = {};
        let content = text;

        if (message.hasMedia) {
            const media = await message.downloadMedia();
            options.caption = text;
            content = media; // Send the media object
        } else if (message.hasQuotedMsg) {
            const quoted = await message.getQuotedMessage();
            if (quoted.hasMedia) {
                const media = await quoted.downloadMedia();
                options.caption = text;
                content = media;
            }
        }

        for (const group of groups) {
            try {
                await client.sendMessage(group.id._serialized, content, options);
                sent++;
                // Add delay to avoid ban?
                await new Promise(r => setTimeout(r, 500));
            } catch (e) {
                console.error(`Failed to send to ${group.name}`);
            }
        }

        await message.reply(`✅ Broadcast sent to ${sent}/${groups.length} groups.`);
    }
};
