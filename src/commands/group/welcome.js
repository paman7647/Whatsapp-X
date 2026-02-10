const { GroupConfig } = require('../../models');

module.exports = {
    name: 'welcome',
    category: 'Group',
    description: 'Configure welcome messages',
    usage: 'on | off | set <message>',
    async execute(message, args, client) {
        const chat = await message.getChat();
        if (!chat.isGroup) return message.reply('❌ Group only.');

        const authorId = message.author || message.from;
        const participant = chat.participants.find(p => p.id._serialized === authorId);
        if (!participant.isAdmin) return message.reply('❌ Admin only.');

        const subcommand = args[0]?.toLowerCase();

        let config = await GroupConfig.findOne({ groupId: chat.id._serialized });
        if (!config) {
            config = new GroupConfig({ groupId: chat.id._serialized });
        }

        if (subcommand === 'on') {
            // Logic handled in group_join event (simulated)
            // Ideally we need a flag in GroupConfig like `isWelcomeEnabled`.
            // Schema has `welcomeMessage`, assuming if non-empty it's enabled?
            // Let's assume we use it.
            if (!config.welcomeMessage) config.welcomeMessage = 'Welcome @user to @group!';
            await config.save();
            return message.reply(`✅ Welcome messages enabled.\nCurrent message: ${config.welcomeMessage}`);
        }

        if (subcommand === 'off') {
            config.welcomeMessage = ''; // Disable by clearing? Or needs a flag. 
            // Better to have a flag, but for now empty string = disabled logic.
            await config.save();
            return message.reply('❌ Welcome messages disabled.');
        }

        if (subcommand === 'set') {
            const msg = args.slice(1).join(' ');
            if (!msg) return message.reply('⚠️ Provide a message. Use @user and @group placeholders.');

            config.welcomeMessage = msg;
            await config.save();
            return message.reply(`✅ Welcome message set:\n"${msg}"`);
        }

        return message.reply('Usage: .welcome on | off | set <message>');
    }
};
