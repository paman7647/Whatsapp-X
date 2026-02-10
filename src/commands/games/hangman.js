const words = ['javascript', 'whatsapp', 'developer', 'computer', 'algorithm', 'function', 'variable', 'browser', 'server', 'database'];
const games = new Map();

module.exports = {
    name: 'hangman',
    aliases: ['hang'],
    category: 'Games',
    description: 'Play Hangman',
    usage: 'start | guess <letter> | end',
    async execute(message, args, client) {
        const chatId = message.remote;
        if (!games.has(chatId)) games.set(chatId, null);
        let game = games.get(chatId);

        const subcommand = args[0]?.toLowerCase();

        if (subcommand === 'start') {
            if (game) return message.reply('⚠️ Game already in progress.');

            const word = words[Math.floor(Math.random() * words.length)];
            games.set(chatId, {
                word: word,
                guessed: [],
                tries: 6,
                display: '_'.repeat(word.length).split('')
            });

            return message.reply(`🎮 *Hangman Started!*\n\nWord: ${'_ '.repeat(word.length)}\nTries: 6\n\nUse \`.hang guess <letter>\``);
        }

        if (subcommand === 'guess') {
            if (!game) return message.reply('❌ No game running. Use `.hang start`.');

            const letter = args[1]?.toLowerCase();
            if (!letter || letter.length !== 1 || !/[a-z]/.test(letter)) return message.reply('⚠️ Please guess a single letter.');
            if (game.guessed.includes(letter)) return message.reply('⚠️ You already guessed that letter.');

            game.guessed.push(letter);

            if (game.word.includes(letter)) {
                for (let i = 0; i < game.word.length; i++) {
                    if (game.word[i] === letter) game.display[i] = letter;
                }
            } else {
                game.tries--;
            }

            if (game.display.join('') === game.word) {
                games.delete(chatId);
                return message.reply(`🎉 *You Won!*\nThe word was: *${game.word}*`);
            }

            if (game.tries === 0) {
                games.delete(chatId);
                return message.reply(`💀 *Game Over!*\nThe word was: *${game.word}*`);
            }

            return message.reply(`Word: ${game.display.join(' ')}\nTries: ${game.tries}\nGuessed: ${game.guessed.join(', ')}`);
        }

        if (subcommand === 'end') {
            games.delete(chatId);
            return message.reply('🏳️ Game ended.');
        }

        return message.reply('Usage: .hang start | guess <letter> | end');
    }
};
