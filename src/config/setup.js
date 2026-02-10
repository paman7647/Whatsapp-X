const { Config } = require('../models');
const logger = require('../utils/logger');

async function initializeDefaultConfigs() {
    const defaultConfigs = {
        'BOT_NAME': { value: process.env.BOT_NAME || 'X userbot', description: 'Bot display name' },
        'ENABLE_AI': { value: process.env.ENABLE_AI !== 'false', description: 'Enable AI features' },
        'ENABLE_YOUTUBE': { value: process.env.ENABLE_YOUTUBE !== 'false', description: 'Enable YouTube features' },
        'ENABLE_INSTAGRAM': { value: process.env.ENABLE_INSTAGRAM !== 'false', description: 'Enable Instagram features' },
        'GEMINI_API_KEY': { value: process.env.GEMINI_API_KEY, description: 'Google Gemini API Key' },
        'COMMAND_PREFIX': { value: process.env.COMMAND_PREFIX || '.', description: 'Command prefix' },
        'OWNER_WHATSAPP_ID': { value: process.env.OWNER_WHATSAPP_ID, description: 'Owner WhatsApp ID' },
        'PM_LOG': { value: process.env.PM_LOG === 'true', description: 'Log private messages to owner' }
    };

    try {
        for (const [key, data] of Object.entries(defaultConfigs)) {
            const exists = await Config.findOne({ key });
            if ((!exists || exists.value === null || exists.value === undefined) && data.value) {
                if (exists) {
                    exists.value = data.value;
                    await exists.save();
                    logger.info(`Updated config: ${key}`);
                } else {
                    await Config.create({
                        key,
                        value: data.value,
                        description: data.description
                    });
                    logger.info(`Initialized config: ${key}`);
                }
            }
        }
    } catch (error) {
        logger.error('Error initializing configs:', error);
    }
}

module.exports = initializeDefaultConfigs;
