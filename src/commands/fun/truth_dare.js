module.exports = {
    name: 'truth',
    aliases: ['dare'], // Helper to handle both in one file if we check command name
    description: 'Get a truth or dare question',
    async execute(message, args, client, commandName) { // Assuming commandName passed or we derive from message
        // HACK: derive command name from body since our handler structure might not pass it directly yet
        const cmd = message.body.slice(1).split(' ')[0].toLowerCase();

        const type = (cmd === 'truth') ? 'Truth' : 'Dare';

        const truths = [
            "What's your biggest fear?",
            "Who is your crush?",
            "What's a secret you've never told anyone?",
            "What's the most embarrassing thing you've done?",
            "Have you ever cheated on a test?"
        ];

        const dares = [
            "Send a voice note singing a song.",
            "Post a humiliating status.",
            "Text your crush and say 'I like you'.",
            "Send a selfie right now.",
            "Speak in a different accent for the next 10 minutes."
        ];

        const statusMsg = await message.reply(' *Rolling the dice...*');
        const list = (type === 'Truth') ? truths : dares;
        const random = list[Math.floor(Math.random() * list.length)];

        await statusMsg.edit(` *${type}*\n\n${random}`);
    }
};
