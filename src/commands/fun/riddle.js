const riddles = [
    { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", a: "Echo" },
    { q: "The more of this there is, the less you see. What is it?", a: "Darkness" },
    { q: "I have keys but no locks. I have a space but no room. You can enter, but can't go outside. What am I?", a: "Keyboard" },
    { q: "What has hands but cannot clap?", a: "Clock" }
];

module.exports = {
    name: 'riddle',
    category: 'Fun',
    description: 'Solve a riddle',
    usage: '',
    async execute(message, args, client) {
        const riddle = riddles[Math.floor(Math.random() * riddles.length)];
        await message.reply(`🧩 *Riddle Time!*\n\n${riddle.q}\n\n_Answer hidden for 10s_`);

        setTimeout(async () => {
            await client.sendMessage(message.remote, `💡 Answer: *${riddle.a}*`);
        }, 10000);
    }
};
