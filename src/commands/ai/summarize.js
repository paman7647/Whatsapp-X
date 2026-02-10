const pythonBridge = require('../../services/pythonBridge');
const logger = require('../../utils/logger');

module.exports = {
    name: 'summarize',
    aliases: ['sum', 'brief'],
    description: 'Summarize long text or quoted messages (Python AI)',
    usage: '(reply to text) or [text]',
    category: 'AI',
    async execute(message, args, client) {
        let text = args.join(' ');

        // Find text from quoted message if no args
        if (!text && message.hasQuotedMsg) {
            const quoted = await message.getQuotedMessage();
            text = quoted.body;
        }

        if (!text || text.length < 50) {
            return message.reply('❌ Please provide at least 50 characters of text to summarize, or reply to a long message.');
        }

        const statusMsg = await message.reply('🤖 *AI: Analyzing and summarizing...*');

        try {
            const result = await pythonBridge.call('ai_suite.py', 'summarize', {
                text: text,
                count: 3
            });

            if (result.status === 'error' || typeof result === 'string' && result.includes('Error')) {
                return await statusMsg.edit(`❌ ${result.message || result}`);
            }

            const summary = result.data || result;
            await statusMsg.edit(`📝 *Summary:*\n\n${summary}`);

        } catch (error) {
            logger.error('Summarize Error:', error);
            await statusMsg.edit('❌ Summarization failed. Ensure Python dependencies are installed.');
        }
    }
};
