// TicTacToe utilities are inlined

// For now, let's keep it simple and self-contained or use a map
const games = new Map();

module.exports = {
    name: 'tictactoe',
    aliases: ['ttt', 'xo'],
    category: 'Games',
    description: 'Play Tic-Tac-Toe with a friend',
    usage: 'challenge @user | accept | move <1-9> | end',
    async execute(message, args, client) {
        const senderId = message.author || message.from;
        const chatId = message.remote;

        // Single game per chat for simplicity
        if (!games.has(chatId)) games.set(chatId, null);
        let game = games.get(chatId);

        const subcommand = args[0]?.toLowerCase();

        if (subcommand === 'challenge' || subcommand === 'play') {
            if (game) return message.reply('⚠️ A game is already in progress in this chat.');

            const mentions = await message.getMentions();
            if (mentions.length !== 1) return message.reply('⚠️ Please mention one user to challenge.');

            const opponentId = mentions[0].id._serialized;
            if (opponentId === client.info.wid._serialized) return message.reply('🤖 I cannot play yet (soon!).');
            if (opponentId === senderId) return message.reply('❌ You cannot challenge yourself.');

            games.set(chatId, {
                p1: senderId,
                p2: opponentId,
                board: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
                turn: senderId,
                state: 'PENDING'
            });

            return message.reply(`⚔️ @${senderId.split('@')[0]} challenged @${opponentId.split('@')[0]} to Tic-Tac-Toe!\n\nType \`.ttt accept\` to begin.`, undefined, { mentions: [senderId, opponentId] });
        }

        if (subcommand === 'accept') {
            if (!game || game.state !== 'PENDING') return message.reply('❌ No pending challenge.');
            if (game.p2 !== senderId) return message.reply('❌ Only the challenged user can accept.');

            game.state = 'PLAYING';
            return message.reply(`🎮 Game started!\n\n${formatBoard(game.board)}\n\n@${game.turn.split('@')[0]}'s turn (X). Type \`.ttt move <1-9>\`.`, undefined, { mentions: [game.turn] });
        }

        if (subcommand === 'move') {
            if (!game || game.state !== 'PLAYING') return message.reply('❌ No game in progress.');
            if (game.turn !== senderId) return message.reply('⏳ It is not your turn!');

            const pos = parseInt(args[1]);
            if (isNaN(pos) || pos < 1 || pos > 9) return message.reply('⚠️ Invalid move. Use 1-9.');
            if (game.board[pos - 1] === 'X' || game.board[pos - 1] === 'O') return message.reply('⚠️ Spot taken!');

            const symbol = game.turn === game.p1 ? 'X' : 'O';
            game.board[pos - 1] = symbol;

            if (checkWin(game.board)) {
                games.delete(chatId);
                return message.reply(`🏆 *Game Over!*\n\n${formatBoard(game.board)}\n\n🎉 @${senderId.split('@')[0]} wins!`, undefined, { mentions: [senderId] });
            }

            if (game.board.every(c => c === 'X' || c === 'O')) {
                games.delete(chatId);
                return message.reply(`🤝 *Draw!*\n\n${formatBoard(game.board)}`);
            }

            // Switch turn
            game.turn = game.turn === game.p1 ? game.p2 : game.p1;
            return message.reply(`${formatBoard(game.board)}\n\n@${game.turn.split('@')[0]}'s turn (${symbol === 'X' ? 'O' : 'X'}).`, undefined, { mentions: [game.turn] });
        }

        if (subcommand === 'end') {
            if (!game) return message.reply('❌ No game to end.');
            if (game.p1 !== senderId && game.p2 !== senderId) return message.reply('❌ You are not in this game.');

            games.delete(chatId);
            return message.reply('🏳️ Game ended.');
        }

        return message.reply('Use: .ttt challenge @user | accept | move <1-9> | end');
    }
};

function formatBoard(b) {
    return `\`\`\`
 ${b[0]} | ${b[1]} | ${b[2]} 
---+---+---
 ${b[3]} | ${b[4]} | ${b[5]} 
---+---+---
 ${b[6]} | ${b[7]} | ${b[8]} 
\`\`\``;
}

function checkWin(b) {
    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    return wins.some(w => b[w[0]] === b[w[1]] && b[w[1]] === b[w[2]]);
}
