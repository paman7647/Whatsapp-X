const { SudoUser } = require('../../models');

module.exports = {
    name: 'sudo',
    description: 'Manage sudo users (Trusted users)',
    usage: 'add @user | remove @user | list',
    category: 'owner',
    ownerOnly: true,
    async execute(message, args, client) {
        if (!args[0]) return message.reply('Usage: `/sudo <add|remove|list> @user`');

        const action = args[0].toLowerCase();
        const myId = client.info.wid._serialized;

        try {
            switch (action) {
                case 'add':
                    const targetId = message.mentionedIds[0] || (message.hasQuotedMsg ? (await message.getQuotedMessage()).author : null);
                    if (!targetId) return message.reply(' Please mention a user or reply to their message.');

                    await SudoUser.findOneAndUpdate(
                        { whatsappId: targetId },
                        { addedBy: myId, isActive: true },
                        { upsert: true }
                    );
                    await message.reply(` User *${targetId.replace('@c.us', '')}* added to sudo list.`);
                    break;

                case 'remove':
                case 'del':
                    const delId = message.mentionedIds[0] || (message.hasQuotedMsg ? (await message.getQuotedMessage()).author : null);
                    if (!delId) return message.reply(' Please mention a user or reply to their message.');

                    const res = await SudoUser.deleteOne({ whatsappId: delId });
                    if (res.deletedCount === 0) return message.reply(' User not in sudo list.');
                    await message.reply(` User *${delId.replace('@c.us', '')}* removed from sudo list.`);
                    break;

                case 'list':
                    const users = await SudoUser.find({ isActive: true });
                    if (users.length === 0) return message.reply(' No sudo users added.');
                    const list = users.map(u => ` @${u.whatsappId.replace('@c.us', '')}`).join('\n');
                    await message.reply(` *Sudo Users:*\n\n${list}`, { mentions: users.map(u => u.whatsappId) });
                    break;

                default:
                    await message.reply(' Unknown action. Use: add, remove, list');
            }
        } catch (error) {
            console.error('Sudo Error:', error);
            await message.reply(' An error occurred with sudo management.');
        }
    }
};
