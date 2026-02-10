const fs = require('fs');
const path = require('path');
const config = require('../../config/config');

module.exports = {
    name: 'help',
    aliases: ['menu', 'h', 'commands'],
    category: 'Utility',
    description: 'Show available commands',
    usage: '[command name]',
    async execute(message, args, client) {
        const prefix = config.prefix;

        const categories = {
            'ai': '🤖 AI & Chat',
            'business': '💼 Business',
            'education': '📚 Education',
            'fun': '🎡 Fun',
            'games': '🎮 Games',
            'group': '👥 Group',
            'media': '🎬 Media',
            'owner': '👑 Owner',
            'productivity': '🚀 Productivity',
            'search': '🔍 Search',
            'social': '💬 Social',
            'system': '🖥️ System',
            'tech': '💻 Tech',
            'utility': '🔧 Utility'
        };

        // Specific command help
        if (args[0]) {
            const cmdName = args[0].toLowerCase();
            let foundCmd = null;

            // Scan all possible paths
            for (const folder of Object.keys(categories)) {
                const folderPath = path.join(__dirname, '..', folder);
                if (fs.existsSync(folderPath)) {
                    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
                    for (const file of files) {
                        try {
                            const cmd = require(path.join(folderPath, file));
                            if (cmd.name === cmdName || (cmd.aliases && cmd.aliases.includes(cmdName))) {
                                foundCmd = cmd;
                                break;
                            }
                        } catch (e) { }
                    }
                }
                if (foundCmd) break;
            }

            if (!foundCmd) return message.reply('❌ Command not found.');

            const info = `
╭─── *Command Info* ───
│
│ 📚 *Name:* ${foundCmd.name}
│ 📝 *Desc:* ${foundCmd.description || 'No description'}
│ 📂 *Category:* ${categories[foundCmd.category?.toLowerCase()] || foundCmd.category || 'General'}
│ ⌨️ *Usage:* ${prefix}${foundCmd.name} ${foundCmd.usage || ''}
│ 🔗 *Aliases:* ${foundCmd.aliases ? foundCmd.aliases.join(', ') : 'None'}
│
╰──────────────────────
            `.trim();

            return message.reply(info);
        }

        // Full Menu
        let menu = `╭─── 🤖 *BOT MENU* ────
│
│ *Prefix:* ${prefix}
│ *Date:* ${new Date().toLocaleDateString()}
│
`;

        let totalCommands = 0;

        for (const [folder, emojiTitle] of Object.entries(categories)) {
            const folderPath = path.join(__dirname, '..', folder);
            if (fs.existsSync(folderPath)) {
                const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
                if (files.length > 0) {
                    // Sort commands alphabetically
                    const cmds = files.map(file => {
                        try {
                            const cmd = require(path.join(folderPath, file));
                            return cmd.name;
                        } catch (e) { return null; }
                    }).filter(Boolean).sort();

                    totalCommands += cmds.length;

                    menu += `│ *${emojiTitle}* (${cmds.length})\n│ ${cmds.map(c => `\`${c}\``).join(', ')}\n│\n`;
                }
            }
        }

        menu += `│
│ *Total Commands:* ${totalCommands}
│
╰── _${prefix}help <cmd> for info_ ──
        `.trim();

        await message.reply(menu);
    }
};
