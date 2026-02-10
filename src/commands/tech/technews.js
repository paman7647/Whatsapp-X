const NewsAPI = require('newsapi');
const config = require('../../config/config');

module.exports = {
    name: 'technews',
    aliases: ['tech', 'news'],
    description: 'Get latest tech news',
    usage: '(no args)',
    async execute(message, args, client) {
        // Fallback or use a free feed if no key
        // Simulating fetch or using a simple RSS-to-JSON if configured

        // For now, let's use a reliable tech news RSS feed parser or simple scrape
        // Since NewsAPI requires a key, we'll try to use it if available, else fallback msg

        const statusMsg = await message.reply(' *Fetching latest tech news...*');

        if (!config.newsApiKey) {
            return await statusMsg.edit(' NewsAPI Key not configured. Please set `NEWS_GEMINI_API_KEY` (or generic NEWS_API_KEY).');
        }

        const newsapi = new NewsAPI(config.newsApiKey);

        try {
            const response = await newsapi.v2.topHeadlines({
                category: 'technology',
                language: 'en',
                country: 'us'
            });

            if (response.status === 'ok' && response.articles.length > 0) {
                let text = ' *Latest Tech News*\n\n';
                const articles = response.articles.slice(0, 5); // Top 5

                articles.forEach((article, index) => {
                    text += `${index + 1}. *${article.title}*\n${article.description ? article.description.substring(0, 100) + '...' : ''}\n ${article.url}\n\n`;
                });

                await statusMsg.edit(text);
            } else {
                await statusMsg.edit(' No news found.');
            }

        } catch (error) {
            console.error(error);
            await statusMsg.edit(' Failed to fetch news.');
        }
    }
};
