const generator = require('generate-password');

module.exports = {
    name: 'password',
    description: 'Generate a secure random password',
    usage: '<length> [flags]',
    category: 'Utility',
    aliases: ['pass', 'genpass'],
    async execute(message, args) {
        let length = parseInt(args[0]);

        if (!length || isNaN(length)) {
            length = 12; // Default length
        }

        if (length > 100) return message.reply('⚠️ Max length is 100.');
        if (length < 4) return message.reply('⚠️ Min length is 4.');

        try {
            const password = generator.generate({
                length: length,
                numbers: true,
                symbols: true,
                uppercase: true,
                lowercase: true,
                excludeSimilarCharacters: true // Avoid l, 1, I, o, 0, O
            });

            // Send in a way that is easy to copy (e.g., in a code block or separate message)
            await message.reply(`🔐 *Generated Password (${length} chars):*\n\n\`${password}\``);

        } catch (error) {
            console.error('Password Gen Error:', error);
            await message.reply('❌ Failed to generate password.');
        }
    }
};
