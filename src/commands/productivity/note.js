const { Note } = require('../../models');

module.exports = {
    name: 'note',
    aliases: ['notes', 'remember'],
    category: 'Productivity',
    description: 'Save and retrieve personal notes',
    usage: 'add <title> <content> | list | get <title> | delete <title>',
    async execute(message, args, client) {
        const userId = message.author || message.from;
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            return message.reply('Usage:\n.note add <title> <content>\n.note list\n.note get <title>\n.note delete <title>');
        }

        try {
            if (subcommand === 'add') {
                const title = args[1];
                const content = args.slice(2).join(' ');
                if (!title || !content) return message.reply('⚠️ Usage: .note add <title> <content>');

                // Check if note exists
                const existing = await Note.findOne({ userId, title });
                if (existing) {
                    existing.content = content;
                    await existing.save();
                    return message.reply(`✅ Updated note: *${title}*`);
                }

                await Note.create({ userId, title, content });
                return message.reply(`✅ Saved note: *${title}*`);
            }

            if (subcommand === 'list') {
                const notes = await Note.find({ userId });
                if (notes.length === 0) return message.reply('You have no saved notes.');

                const list = notes.map(n => `- ${n.title}`).join('\n');
                return message.reply(`📒 *Your Notes:*\n\n${list}`);
            }

            if (subcommand === 'get' || subcommand === 'read') {
                const title = args[1];
                if (!title) return message.reply('⚠️ Usage: .note get <title>');

                const note = await Note.findOne({ userId, title });
                if (!note) return message.reply('❌ Note not found.');

                return message.reply(`📒 *${note.title}*\n\n${note.content}`);
            }

            if (subcommand === 'delete') {
                const title = args[1];
                if (!title) return message.reply('⚠️ Usage: .note delete <title>');

                const deleted = await Note.findOneAndDelete({ userId, title });
                if (!deleted) return message.reply('❌ Note not found.');

                return message.reply(`🗑️ Deleted note: *${title}*`);
            }
        } catch (error) {
            console.error('Note command error:', error);
            message.reply('❌ An error occurred.');
        }
    }
};
