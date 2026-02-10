const { Todo } = require('../../models');

module.exports = {
    name: 'todo',
    aliases: ['task', 'tasks'],
    category: 'Productivity',
    description: 'Manage your personal todo list',
    usage: 'add <task> | list | done <id> | delete <id>',
    async execute(message, args, client) {
        const userId = message.author || message.from;
        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            return message.reply('Usage:\n.todo add <task>\n.todo list\n.todo done <id>\n.todo delete <id>');
        }

        try {
            if (subcommand === 'add') {
                const taskText = args.slice(1).join(' ');
                if (!taskText) return message.reply('⚠️ Please provide a task description.');

                await Todo.create({ userId, task: taskText });
                return message.reply(`✅ Added task: *"${taskText}"*`);
            }

            if (subcommand === 'list') {
                const todos = await Todo.find({ userId, completed: false }).sort({ createdAt: -1 });
                if (todos.length === 0) return message.reply('🎉 You have no pending tasks!');

                const list = todos.map((t, i) => `${i + 1}. ${t.task}`).join('\n');
                return message.reply(`📝 *Your To-Do List:*\n\n${list}\n\n_Use .todo done <number> to complete_`);
            }

            if (subcommand === 'done' || subcommand === 'delete') {
                const index = parseInt(args[1]) - 1;
                if (isNaN(index)) return message.reply('⚠️ Please provide a valid task number.');

                const todos = await Todo.find({ userId, completed: false }).sort({ createdAt: -1 });
                if (!todos[index]) return message.reply('❌ Task not found.');

                const todo = todos[index];
                if (subcommand === 'done') {
                    todo.completed = true;
                    await todo.save();
                    return message.reply(`✅ Marked as done: *"${todo.task}"*`);
                } else {
                    await todo.deleteOne();
                    return message.reply(`🗑️ Deleted task: *"${todo.task}"*`);
                }
            }
        } catch (error) {
            console.error('Todo command error:', error);
            message.reply('❌ An error occurred while managing todos.');
        }
    }
};
