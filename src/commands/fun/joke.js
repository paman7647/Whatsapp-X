const axios = require('axios');

module.exports = {
    name: 'joke',
    category: 'Fun',
    description: 'Tell a random joke',
    usage: '',
    aliases: ['funny', 'jest'],
    async execute(message, args, client) {
        try {
            // Official Joke API
            const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
            const { setup, punchline } = response.data;

            await message.reply(`
😂 *Joke of the Moment*

🗣️ ${setup}
...
😆 *${punchline}*
            `.trim());

        } catch (error) {
            console.error('Joke API Error:', error);
            // Fallback jokes
            const backups = [
                "Why do programmers prefer dark mode? Because light attracts bugs.",
                "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
                "Why was the JavaScript developer sad? Because he didn't know how to 'null' his feelings.",
                "I told my computer I needed a break, and now it won't stop sending me Kit-Kats."
            ];
            const backupJoke = backups[Math.floor(Math.random() * backups.length)];
            await message.reply(`(API Offline) 😂\n\n${backupJoke}`);
        }
    }
};
