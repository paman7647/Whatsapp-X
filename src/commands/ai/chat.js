const { GoogleGenAI } = require('@google/genai');
const config = require('../../config/config');
const logger = require('../../utils/logger');

// Initialize the client with the newer SDK
const genai = new GoogleGenAI({ apiKey: config.geminiApiKey });

module.exports = {
    name: 'ai',
    aliases: ['chat', 'ask', 'gemini'],
    description: 'Chat with Google Gemini AI',
    usage: '<prompt>',
    category: 'AI',
    async execute(message, args) {
        let prompt = args.join(' ');

        // Handle quoted message if no prompt provided
        if (!prompt && message.hasQuotedMsg) {
            const quoted = await message.getQuotedMessage();
            prompt = quoted.body;
        }

        if (!prompt) {
            return message.reply('Please provide a prompt or reply to a message. Example: `/ai What is the capital of France?`');
        }

        const statusMsg = await message.reply('*AI is thinking...*');

        try {
            const result = await genai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });

            const text = result.candidates[0].content.parts[0].text;
            await statusMsg.edit(text);

        } catch (error) {
            logger.error('Gemini AI Error:', error);
            await statusMsg.edit(' An error occurred while contacting the AI. Please verify your API key and try again.');
        }
    }
};
