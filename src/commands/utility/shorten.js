const axios = require('axios');

module.exports = {
    name: 'shorten',
    aliases: ['short'],
    description: 'Shorten a URL',
    usage: '<url>',
    async execute(message, args, client) {
        if (args.length === 0) return message.reply('Please provide a URL.');

        let url = args[0];
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const statusMsg = await message.reply(' *Shortening URL...*');

        try {
            const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            await statusMsg.edit(` *Shortened URL:*\n${res.data}`);
        } catch (error) {
            console.error('Shorten Error:', error.message);
            await statusMsg.edit(' Failed to shorten URL. Make sure it is a valid link.');
        }
    }
};
