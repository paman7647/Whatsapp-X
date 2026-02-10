module.exports = {
    name: 'ping',
    description: 'Check if the bot is responsive',
    async execute(message, args) {
        const start = Date.now();
        console.log('Ping command executed');
        await message.reply(' Pong!');
        // const end = Date.now();
        // await message.reply(`Latency: ${end - start}ms`);
    }
};
