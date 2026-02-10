const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'pp',
    aliases: ['pfp', 'profilepic', 'dp'],
    category: 'Social',
    description: 'Get profile picture of a user',
    usage: '@user',
    async execute(message, args, client) {
        let contact;
        const mentions = await message.getMentions();

        if (mentions.length > 0) {
            contact = mentions[0];
        } else if (args.length > 0) {
            // Helper to find contact by number?
            // For now, simpler to rely on mentions or Quoted
            // But let's check quoted
        }

        if (!contact && message.hasQuotedMsg) {
            contact = await (await message.getQuotedMessage()).getContact();
        }

        if (!contact) {
            // Self
            contact = await message.getContact();
        }

        try {
            const picUrl = await contact.getProfilePicUrl();
            if (!picUrl) return message.reply('❌ User has no profile picture or privacy settings prevent viewing.');

            const media = await MessageMedia.fromUrl(picUrl);
            await message.reply(media, undefined, { caption: `🖼️ Profile Picture: *${contact.pushname || contact.number}*` });

        } catch (error) {
            console.error('PP command error:', error);
            await message.reply('❌ Failed to fetch profile picture.');
        }
    }
};
