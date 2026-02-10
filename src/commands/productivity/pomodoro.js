module.exports = {
    name: 'pomodoro',
    aliases: ['pomo', 'focus'],
    category: 'Productivity',
    description: 'Start a Pomodoro focus timer',
    usage: 'start [minutes] | stop | status',
    async execute(message, args, client) {
        const userId = message.author || message.from;

        // In-memory store for active sessions (simple version)
        // Ideally use a database or a global Map in a separate service
        if (!global.pomodoroSessions) global.pomodoroSessions = new Map();

        const subcommand = args[0]?.toLowerCase();

        if (subcommand === 'stop') {
            if (global.pomodoroSessions.has(userId)) {
                clearTimeout(global.pomodoroSessions.get(userId).timeout);
                global.pomodoroSessions.delete(userId);
                return message.reply('🛑 Pomodoro timer stopped.');
            } else {
                return message.reply('❌ You don\'t have an inactive Pomodoro session.');
            }
        }

        if (subcommand === 'status') {
            if (global.pomodoroSessions.has(userId)) {
                const session = global.pomodoroSessions.get(userId);
                const timeLeft = Math.ceil((session.endTime - Date.now()) / 60000);
                return message.reply(`🍅 Focus mode active! ${timeLeft} minutes remaining.`);
            } else {
                return message.reply('❌ No active session.');
            }
        }

        // Start new session
        if (global.pomodoroSessions.has(userId)) {
            return message.reply('⚠️ You already have a session running. Use `.pomo stop` first.');
        }

        const duration = parseInt(args[1]) || 25; // Default 25 mins
        const endTime = Date.now() + duration * 60000;

        await message.reply(`🍅 Pomodoro started! Focus for *${duration} minutes*.\nI will notify you when time is up.`);

        const timeout = setTimeout(async () => {
            const contact = await message.getContact();
            const mentionId = contact.id._serialized;

            await client.sendMessage(message.remote, `⏰ *Time's up!* @${contact.id.user}, take a break!`, {
                mentions: [mentionId]
            });
            global.pomodoroSessions.delete(userId);
        }, duration * 60000);

        global.pomodoroSessions.set(userId, {
            timeout,
            endTime
        });
    }
};
