const axios = require('axios');

module.exports = {
    name: 'github',
    aliases: ['gh', 'git'],
    description: 'Search GitHub user or repo',
    usage: '<username|repo>',
    async execute(message, args, client) {
        if (args.length === 0) return message.reply('Please provide a username or repo name.');

        const query = args[0];

        const statusMsg = await message.reply(` *Searching for GitHub user "${query}"...*`);

        try {
            const res = await axios.get(`https://api.github.com/users/${query}`);
            const data = res.data;

            const text = ` *GitHub User: ${data.login}*\n\n` +
                ` *Bio*: ${data.bio || 'No bio'}\n` +
                ` *Repos*: ${data.public_repos}\n` +
                ` *Followers*: ${data.followers}\n` +
                ` *Profile*: ${data.html_url}`;

            const { MessageMedia } = require('whatsapp-web.js');
            try {
                const media = await MessageMedia.fromUrl(data.avatar_url);
                await message.reply(media, undefined, { caption: text });
                await statusMsg.delete(true).catch(() => { });
            } catch (e) {
                await statusMsg.edit(text);
            }

        } catch (error) {
            await statusMsg.edit(' User not found.');
        }
    }
};
