const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'whois',
    aliases: ['user', 'profile', 'info'],
    category: 'Utility',
    description: 'Get detailed information about a user',
    usage: '<@user>',
    async execute(message, args, client) {
        let contact;
        const mentions = await message.getMentions();

        if (mentions.length > 0) {
            contact = mentions[0];
        } else if (message.fromMe) {
            contact = await client.getContactById(message.to); // If self-chat or sent to someone
        } else {
            contact = await message.getContact();
        }

        // If explicitly replying to a message, prioritize that user
        if (message.hasQuotedMsg) {
            const quotedMsg = await message.getQuotedMessage();
            contact = await quotedMsg.getContact();
        }

        if (!contact) return message.reply('❌ Could not find user.');

        await message.reply(`🔍 *Fetching profile for ${contact.pushname || contact.number}...*`);

        try {
            const chat = await contact.getChat();

            let about = '';
            try {
                about = await contact.getAbout() || '-';
            } catch (e) { about = '🔒 Private'; }

            let picUrl = '';
            try {
                picUrl = await contact.getProfilePicUrl();
            } catch (e) { picUrl = ''; }

            const infoText = `
👤 *USER PROFILE*

🏷️ *Name:* ${contact.pushname || contact.name || 'Unknown'}
📱 *Number:* +${contact.number}
🆔 *ID:* ${contact.id._serialized}
📝 *About:* ${about}
🏢 *Business:* ${contact.isBusiness ? '✅ Yes' : '❌ No'}
⭐ *Saved Contact:* ${contact.isMyContact ? '✅ Yes' : '❌ No'}
            `.trim();

            if (picUrl) {
                const media = await MessageMedia.fromUrl(picUrl);
                await message.reply(media, undefined, { caption: infoText });
            } else {
                await message.reply(infoText);
            }

        } catch (error) {
            console.error('Whois error:', error);
            await message.reply('⚠️ Failed to fetch full profile info.');
        }
    }
};
