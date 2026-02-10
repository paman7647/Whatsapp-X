const moment = require('moment');

module.exports = {
    name: 'remind',
    aliases: ['reminder', 'remindme'],
    category: 'Productivity',
    description: 'Set a reminder',
    usage: '<time> <message> (e.g. .remind 10m Check email)',
    async execute(message, args, client) {
        if (args.length < 2) {
            return message.reply('⚠️ Usage: .remind <time> <message>\nExample: .remind 10m Take a break');
        }

        const timeStr = args[0];
        const reminderMsg = args.slice(1).join(' ');

        // Parse time (simple regex for m/h/d)
        const match = timeStr.match(/^(\d+)([mhd])$/);
        if (!match) {
            return message.reply('⚠️ Invalid time format. Use m (minutes), h (hours), d (days).\nExample: 10m, 1h, 2d');
        }

        const amount = parseInt(match[1]);
        const unit = match[2];

        let durationMs = 0;
        if (unit === 'm') durationMs = amount * 60 * 1000;
        if (unit === 'h') durationMs = amount * 60 * 60 * 1000;
        if (unit === 'd') durationMs = amount * 24 * 60 * 60 * 1000;

        if (durationMs > 24 * 60 * 60 * 1000 * 30) { // Max 30 days
            return message.reply('❌ Reminder time too long. Max 30 days.');
        }

        const targetTime = moment().add(durationMs, 'ms').format('h:mm A, MMM Do');

        await message.reply(`⏰ Reminder set for *${targetTime}*:\n"${reminderMsg}"`);

        // Using setTimeout for simplicity (not persistent across restarts)
        // For production, use node-cron or database polling
        setTimeout(async () => {
            const contact = await message.getContact();
            const mentionId = contact.id._serialized;

            await client.sendMessage(message.remote, `⏰ *REMINDER* @${contact.id.user}\n\n📌 ${reminderMsg}`, {
                mentions: [mentionId]
            });
        }, durationMs);
    }
};
