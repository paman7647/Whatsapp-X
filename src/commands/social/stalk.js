const axios = require('axios');
const moment = require('moment');

module.exports = {
    name: 'stalk',
    aliases: ['stalkig', 'iginfo'],
    category: 'Social',
    description: 'Stalk a GitHub or Instagram user',
    usage: 'github <username> | instagram <username>',
    async execute(message, args, client) {
        const platform = args[0]?.toLowerCase();
        const username = args[1];

        if (!platform || !username) return message.reply('⚠️ Usage: .stalk github <username> | instagram <username>');

        // GITHUB STALK
        if (['github', 'gh'].includes(platform)) {
            try {
                const res = await axios.get(`https://api.github.com/users/${username}`);
                const data = res.data;

                const info = `
🐙 *GitHub Profile: ${data.login}*

👤 *Name:* ${data.name || 'N/A'}
📄 *Bio:* ${data.bio || 'N/A'}
🏢 *Company:* ${data.company || 'N/A'}
📍 *Location:* ${data.location || 'N/A'}
📦 *Repos:* ${data.public_repos}
👥 *Followers:* ${data.followers}
👣 *Following:* ${data.following}
📅 *Created:* ${moment(data.created_at).format('DD MMM YYYY')}
🔗 *URL:* ${data.html_url}
                `.trim();

                const { MessageMedia } = require('whatsapp-web.js');
                const media = await MessageMedia.fromUrl(data.avatar_url);

                await message.reply(media, undefined, { caption: info });

            } catch (e) {
                console.error('Github stalk error:', e);
                await message.reply('❌ User not found or API error.');
            }
            return;
        }

        // INSTAGRAM STALK (Using an unofficial API or scraper fallback logic)
        if (['instagram', 'ig'].includes(platform)) {
            // Basic implementation using a public API (e.g., api.popcat.xyz or similar free tier if available)
            // Since reliable free IG APIs are scarce, we'll try a common one or simulate
            try {
                // Example usage of a public API wrapper (replace with real one if you have a key)
                // For this demo, we'll use a placeholder or basic scrape if possible.
                // Actually, let's use a simpler approach: just link the profile.
                // Real IG scraping is hard without login.

                // If you have 'instagram-url-direct', it might help with posts, not profiles.

                await message.reply(`📸 *Instagram Profile*\n\nUser: *${username}*\nLink: https://instagram.com/${username}\n\n_Detailed fetching is restricted by Instagram API._`);

            } catch (e) {
                await message.reply('❌ Could not fetch Instagram info.');
            }
            return;
        }

        message.reply('⚠️ Unknown platform. Use github or instagram.');
    }
};
