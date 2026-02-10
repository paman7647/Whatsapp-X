module.exports = {
    name: 'purge',
    aliases: ['del'],
    description: 'Delete multiple messages in a chat',
    usage: '<number>',
    category: 'Owner',
    ownerOnly: true,
    async execute(message, args, client) {
        const limit = args[0] && !isNaN(args[0]) ? parseInt(args[0]) : 1;
        if (limit > 100) return message.reply(' Maximum purge limit is 100.');

        try {
            const chat = await message.getChat();
            // Fetch messages, including the command message
            const messages = await chat.fetchMessages({ limit: limit + 1 });

            let deletedCount = 0;
            let isAdmin = true;

            if (chat.isGroup) {
                const myId = client.info.wid._serialized;
                const me = chat.participants.find(p => p.id._serialized === myId);
                isAdmin = me ? (me.isAdmin || me.isSuperAdmin) : false;
            }

            // WhatsApp allows deleting messages for everyone up to ~60 hours
            const TIME_LIMIT = 60 * 60 * 60 * 1000;
            const now = Date.now();

            for (const msg of messages) { // Don't reverse, delete newest first usually works better? Or reverse is fine.
                try {
                    // Skip the command message itself until the end or let it be deleted
                    if (msg.id.id === message.id.id) continue;

                    const isWithinTime = (now - (msg.timestamp * 1000)) < TIME_LIMIT;

                    // Admin can delete any message within time limit
                    // Bot can always delete its own message

                    if (msg.fromMe) {
                        await msg.delete(true);
                        deletedCount++;
                    } else if (isAdmin && isWithinTime) {
                        await msg.delete(true);
                        deletedCount++;
                    } else {
                        // Can't delete for everyone, so ignore or delete for self (pointless for purge)
                        // console.log(`Cannot delete message from ${msg.from}`);
                    }

                    await new Promise(r => setTimeout(r, 200)); // Delay to prevent rate limits
                } catch (e) {
                    // logger.error(`Failed to delete message: ${e.message}`);
                }
            }

            // Delete the command message last
            try { await message.delete(true); } catch (e) { }

            const finalCount = Math.max(0, deletedCount - 1); // Subtract the command itself
            if (deletedCount > 0) {
                await chat.sendMessage(` Cleaned up **${deletedCount}** messages for you!`);
            } else {
                await message.reply("I couldn't find any messages to delete! ");
            }
        } catch (error) {
            logger.error('Purge failed:', error);
            await message.reply("Oops! I ran into a bit of trouble while cleaning up. ");
        }
    }
};
