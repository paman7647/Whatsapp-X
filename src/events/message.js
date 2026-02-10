const { handleCommand } = require('../handlers/commandHandler');
const logger = require('../utils/logger');
const config = require('../config/config');
const moment = require('moment');

const { User, PMRequest } = require('../models');

module.exports = {
    name: 'message_create',
    async execute(message, client) {
        try {
            // Skip status updates and newsletters
            if (message.from.includes('status') || message.from.includes('newsletter')) {
                return;
            }

            const isGroup = message.from.endsWith('@g.us');
            const isMe = message.fromMe;
            const senderId = message.author || message.from;
            const myId = client.info.wid._serialized;

            // --- Moderation (Anti-Link) ---
            if (isGroup && !isMe) {
                const { GroupConfig } = require('../models');
                const config = await GroupConfig.findOne({ groupId: message.from });

                if (config && config.antilink) {
                    // Check if sender is admin (admins allowed)
                    const chat = await message.getChat();
                    const participant = chat.participants.find(p => p.id._serialized === senderId);
                    const isAdmin = participant.isAdmin || participant.isSuperAdmin;

                    if (!isAdmin) {
                        const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(wa\.me\/[^\s]+)/gi;
                        if (linkRegex.test(message.body)) {
                            await message.delete(true); // Delete for everyone
                            await chat.sendMessage(`⚠️ @${senderId.split('@')[0]}, links are not allowed here!`, { mentions: [senderId] });
                            return; // Stop processing
                        }
                    }
                }
            }

            // --- AFK Logic ---
            const owner = await User.findOne({ whatsappId: myId });

            // 1. Reset AFK if owner sends message
            if (isMe && owner?.afk?.isAfk) {
                owner.afk.isAfk = false;
                await owner.save();
                await client.sendMessage(myId, ' *AFK mode disabled automatically (You are back!)*');
            }

            // 2. Reply to tags/DMs if AFK
            if (!isMe && owner?.afk?.isAfk) {
                const isTagged = message.mentionedIds.includes(myId) || (message.hasQuotedMsg && (await message.getQuotedMessage()).fromMe);
                if (!isGroup || isTagged) {
                    const timeAgo = moment(owner.afk.since).fromNow();
                    const afkMsg = ` *I am currently AFK*\n\n*Reason:* ${owner.afk.reason}\n*Since:* ${timeAgo}`;
                    await message.reply(afkMsg);
                }
            }

            // --- DM Logging to Self ---
            // If it's a DM (not from me and not a group), log it to self if enabled
            if (config.enablePMLog && !isGroup && !isMe) {
                try {
                    const contact = await message.getContact();
                    const name = contact.pushname || contact.name || contact.number || 'Unknown';
                    const logMessage = ` *DM Log*\n*From:* ${name} (@${senderId.replace('@c.us', '')})\n*Message:* ${message.body}`;

                    // Avoid infinite loops (actually not possible here but good practice)
                    if (senderId !== myId) {
                        await client.sendMessage(myId, logMessage);
                    }
                } catch (logError) {
                    logger.error('Error logging DM to self:', logError);
                }
            }

            // --- Note Hashtag Trigger ---
            if (message.body && message.body.startsWith('#')) {
                const keyword = message.body.slice(1).trim().split(' ')[0].toLowerCase();
                const { Note } = require('../models');
                const note = await Note.findOne({ userId: myId, title: keyword });
                if (note) {
                    await message.reply(note.content);
                }
            }

            // 2. PM Protection Logic
            if (config.enablePMProtection && !isGroup && !isMe) {
                const normalize = (id) => id.replace('@c.us', '').replace('@s.whatsapp.net', '');
                const isOwner = normalize(senderId) === normalize(config.ownerId);

                let isSudo = false;
                if (!isOwner) {
                    const { SudoUser } = require('../models');
                    const sudo = await SudoUser.findOne({ whatsappId: senderId, isActive: true });
                    if (sudo) isSudo = true;
                }

                if (senderId !== myId && !isOwner && !isSudo) {
                    // Check if approved
                    const request = await PMRequest.findOne({ requesterId: senderId });

                    if (!request || request.status !== 'approved') {
                        // Not approved, send warning
                        let warnCount = 0;
                        if (!request) {
                            await new PMRequest({
                                requesterId: senderId,
                                requesterName: (await message.getContact()).pushname || 'User',
                                status: 'pending'
                            }).save();
                        }

                        // We can use a Map to track warnings in memory or just reply
                        // For simplicity and since no in-memory tracker yet, just warn
                        const warnMsg = ` *PM Protection Active*\n\nHello! I am an automated bot. Please wait for my owner to approve your PM request.\n\nType \`/help\` to see what I can do for you in groups.`;

                        // We should probably check if we already warned recently to avoid spamming
                        await message.reply(warnMsg);
                        return; // Stop execution of other commands
                    }
                }
            }

            // Handle command
            await handleCommand(message, client);

        } catch (error) {
            logger.error('Error in message event:', error);
        }
    }
};
