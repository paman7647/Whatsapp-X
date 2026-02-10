const axios = require('axios');

module.exports = {
    name: 'define',
    aliases: ['dict', 'meaning'],
    description: 'Get definition of a word',
    usage: '<word>',
    category: 'Education',
    async execute(message, args, client) {
        if (args.length === 0) return message.reply('Please provide a word.');

        const word = args[0];

        const statusMsg = await message.reply(` *Looking up the meaning of "${word}" for you...*`);

        try {
            const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = res.data[0];
            const meanings = data.meanings[0];
            const def = meanings.definitions[0].definition;
            const example = meanings.definitions[0].example || 'No example available.';

            const text = ` **Definition: ${data.word}**\n\n` +
                `*${meanings.partOfSpeech}*: ${def}\n\n` +
                `*Example*: "${example}"\n\n` +
                `Hope this helps! `;

            await statusMsg.edit(text);

        } catch (error) {
            await statusMsg.edit("I couldn't find that word in my dictionary, sorry! ");
        }
    }
};
