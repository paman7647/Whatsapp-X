const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Life is what happens when you're busy making other plans. - John Lennon",
    "Get busy living or get busy dying. - Stephen King",
    "You only live once, but if you do it right, once is enough. - Mae West"
];

module.exports = {
    name: 'quote',
    category: 'Fun',
    description: 'Get an inspirational quote',
    usage: '',
    async execute(message, args, client) {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        await message.reply(`💬 *Quote:*\n\n"${quote}"`);
    }
};
