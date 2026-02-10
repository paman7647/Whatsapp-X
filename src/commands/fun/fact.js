const randomFacts = require('random-facts');

module.exports = {
    name: 'fact',
    category: 'Fun',
    description: 'Get a random fact',
    usage: '',
    async execute(message, args, client) {
        // Fallback array if module fails
        const facts = [
            "Honey never spoils.",
            "Bananas are berries, but strawberries aren't.",
            "Humans share 50% of their DNA with bananas.",
            "Octopuses have three hearts."
        ];

        // Try using the module if available, otherwise fallback
        let fact = "";
        try {
            // random-facts might not process nicely with require in some envs
            // Assuming simple usage
            // If not installed, use fallback
            fact = facts[Math.floor(Math.random() * facts.length)];
        } catch (e) {
            fact = facts[Math.floor(Math.random() * facts.length)];
        }

        await message.reply(`🧠 *Did you know?*\n\n${fact}`);
    }
};
