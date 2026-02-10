const { PMRequest } = require('../../models');

module.exports = {
    name: 'permit',
    aliases: ['allow', 'approve'],
    description: 'Approve a user for PM access',
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
            return message.reply(' Please reply to a message or mention a user to permit.');
        }

        try {
            let request = await PMRequest.findOne({ requesterId: targetId });
            if (!request) {
                request = new PMRequest({ requesterId: targetId, status: 'approved' });
            } else {
                request.status = 'approved';
                request.respondedAt = new Date();
            }
            await request.save();

            await message.reply(` User *${targetId.replace('@c.us', '')}* has been approved for PM access.`);

            // Optionally notify the user
            await client.sendMessage(targetId, ' You have been approved to PM this bot.');
        } catch (error) {
            console.error('Permit Error:', error);
            await message.reply(' Failed to approve user.');
        }
    }
};
