const { PMRequest } = require('../../models');

module.exports = {
    name: 'deny',
    aliases: ['disallow', 'disapprove'],
    description: 'Disapprove or block a user for PM access',
    usage: '<reply to msg or mention>',
    category: 'owner',
    ownerOnly: true,
    async execute(message, args, client) {
        let targetId;

        if (message.hasQuotedMsg) {
            const quotedMsg = await message.getQuotedMessage();
            targetId = quotedMsg.author || quotedMsg.from;
        } else if (message.mentionedIds.length > 0) {
            targetId = message.mentionedIds[0];
        } else if (args[0]) {
            targetId = args[0].includes('@c.us') ? args[0] : args[0] + '@c.us';
        }

        if (!targetId) {
            return message.reply(' Please reply to a message or mention a user to deny.');
        }

        try {
            let request = await PMRequest.findOne({ requesterId: targetId });
            if (!request) {
                request = new PMRequest({ requesterId: targetId, status: 'denied' });
            } else {
                request.status = 'denied';
                request.respondedAt = new Date();
            }
            await request.save();

            // Block the user if requested or by default
            const contact = await client.getContactById(targetId);
            await contact.block();

            await message.reply(` User *${targetId.replace('@c.us', '')}* has been denied and blocked.`);
        } catch (error) {
            console.error('Deny Error:', error);
            await message.reply(' Failed to deny user.');
        }
    }
};
