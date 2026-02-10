const math = require('mathjs');

module.exports = {
    name: 'mathquiz',
    aliases: ['solve', 'quiz'],
    category: 'Games',
    description: 'Solve a math problem for fun',
    usage: '',
    async execute(message, args, client) {
        // Generate random problem
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        const n1 = Math.floor(Math.random() * 50) + 1;
        const n2 = Math.floor(Math.random() * 50) + 1;

        const expression = `${n1} ${op} ${n2}`;
        const answer = eval(expression); // Safe for simple numbers

        await message.reply(`🧮 *Math Quiz*\n\nCalculate: *${expression} = ?*\n\nReply with your answer!`);

        // Wait for answer (simple implementation without collector)
        // Ideally we use a collector, but for now we rely on the user to just know.
        // Or we can store active quizzes in a map and check in message event.
        // For simplicity, I'll just post the answer concealed in a spoiler if possible, 
        // or just plain text after a delay, but WA doesn't support spoilers well on all platforms.

        // Better: We hook into message event. But to keep it effectively "simple" 
        // and avoiding complex state management for this POC:

        // Let's just create a quick "one-off" interaction by returning the question.
        // Real interactive quizzes require a "Game Manager" to listen to subsequent messages.
        // For this task, I will leave it as "Self-check" or implementing a basic listener 
        // is too complex for this single file without modifying message.js.

        // Alternative: reveal answer after 10 seconds.
        setTimeout(async () => {
            await client.sendMessage(message.remote, `⏳ Time's up!\nAnswer: *${answer}*`);
        }, 10000);
    }
};
