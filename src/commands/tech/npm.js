const axios = require('axios');

module.exports = {
    name: 'npm',
    description: 'Search for an NPM package',
    usage: '<package_name>',
    category: 'Tech',
    aliases: ['pkg', 'node'],
    async execute(message, args) {
        if (!args[0]) return message.reply('Please provide a package name. Example: `.npm axios`');

        const pkgName = args[0].toLowerCase();
        try {
            const response = await axios.get(`https://registry.npmjs.org/${pkgName}`);
            const data = response.data;

            if (!data.name) {
                return message.reply('❌ Package not found.');
            }

            const latest = data['dist-tags'].latest;
            const versionData = data.versions[latest];

            const reply = `
📦 *NPM Package: ${data.name}*

📝 *Description:* ${data.description || 'No description'}
🏷️ *Latest Version:* ${latest}
⚖️ *License:* ${data.license || 'Unknown'}
👤 *Author:* ${data.author ? data.author.name : 'Unknown'}
🔗 *Link:* https://www.npmjs.com/package/${data.name}
            `.trim();

            await message.reply(reply);

        } catch (error) {
            if (error.response && error.response.status === 404) {
                return message.reply('❌ Package not found.');
            }
            console.error('NPM API Error:', error);
            await message.reply('❌ Failed to fetch NPM data.');
        }
    }
};
