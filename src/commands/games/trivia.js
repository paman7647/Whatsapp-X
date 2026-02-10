const axios = require('axios');
const he = require('he'); // You might need to install 'he' for HTML decoding, or regex replace

module.exports = {
    name: 'trivia',
    aliases: ['triv', 'question'],
    category: 'Games',
    description: 'Answer a trivia question',
    usage: '',
    async execute(message, args, client) {
        try {
            const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
            const data = response.data.results[0];

            if (!data) return message.reply('❌ Could not fetch question.');

            // Decode HTML entities (simple regex replacement for basic ones if 'he' not available)
            const decode = (str) => str.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

            const question = decode(data.question);
            const correctAnswer = decode(data.correct_answer);
            const incorrectAnswers = data.incorrect_answers.map(decode);

            const allAnswers = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5);

            const options = allAnswers.map((a, i) => `${i + 1}. ${a}`).join('\n');

            await message.reply(`❓ *Trivia Time!*\nCategory: ${data.category}\nDifficulty: ${data.difficulty}\n\n*${question}*\n\n${options}\n\n_Reply with the answer text! (Answer hidden for 10s)_`);

            // Spoil the answer after 10 seconds
            setTimeout(async () => {
                await client.sendMessage(message.remote, `💡 The correct answer was: *${correctAnswer}*`);
            }, 10000);

        } catch (error) {
            console.error('Trivia error:', error);
            await message.reply('❌ Error getting trivia.');
        }
    }
};
