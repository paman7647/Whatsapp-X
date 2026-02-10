const config = require('../../config/config');

module.exports = {
    name: 'admin',
    aliases: ['group', 'grp'],
    description: 'Group administration commands',
    usage: '<kick|add|promote|demote> @user',
    groupOnly: true,
    async execute(message, args, client) {
        const chat = await message.getChat();

        if (!chat.isGroup) {
            return message.reply(' This command can only be used in groups.');
        }

        // Check if bot is admin
        const botId = client.info.wid._serialized;
        const botParticipant = chat.participants.find(p => p.id._serialized === botId);
        if (!botParticipant || !botParticipant.isAdmin) {
            return message.reply(' I need to be an Admin to perform this action.');
        }

        // Check if sender is admin
        const senderId = message.author || message.from;
        const senderParticipant = chat.participants.find(p => p.id._serialized === senderId);
        if (!senderParticipant || !senderParticipant.isAdmin) {
            return message.reply(' You need to be an Admin to use this command.');
        }

        if (args.length === 0) {
            return message.reply('Usage: `/admin <kick|add|promote|demote> @user`');
        }

        const action = args[0].toLowerCase();
        let targetId;

        // Get target from mention or reply
        if (message.mentionedIds.length > 0) {
            targetId = message.mentionedIds[0];
        } else if (message.hasQuotedMsg) {
            const quotedMsg = await message.getQuotedMessage();
            targetId = quotedMsg.author || quotedMsg.from;
        } else {
            // Check if argument is a number
            if (args[1]) {
                targetId = args[1].replace('@', '') + '@c.us';
            }
        }

        if (!targetId && action !== 'everyone' && action !== 'tagall') {
            return message.reply(' Please mention a user or reply to their message.');
        }

        try {
            switch (action) {
                case 'kick':
                case 'remove':
                    await chat.removeParticipants([targetId]);
                    await message.reply(' User removed.');
                    break;

                case 'add':
                    await chat.addParticipants([targetId]);
                    await message.reply(' User added.');
                    break;

                case 'promote':
                    await chat.promoteParticipants([targetId]);
                    await message.reply(' User promoted to Admin.');
                    break;

                case 'demote':
                    await chat.demoteParticipants([targetId]);
                    await message.reply(' User demoted.');
                    break;

                case 'tagall':
                case 'everyone':
                    let text = ' *Everyone Audit*\n\n';
                    let mentions = [];
                    for (let participant of chat.participants) {
                        const jid = participant.id._serialized;
                        mentions.push(jid);
                        text += `@${participant.id.user} `;
                    }
                    await chat.sendMessage(text, { mentions });
                    break;

                default:
                    message.reply('Unknown admin action. Use: kick, add, promote, demote, tagall');
            }
        } catch (error) {
            console.error(error);
            message.reply(' Failed to perform action. Ensure I have the correct permissions.');
        }
    }
};
