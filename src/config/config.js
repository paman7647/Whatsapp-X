require('dotenv').config();
const mongoose = require('mongoose');

// Default Config Structure
const defaults = {
    botName: process.env.BOT_NAME || 'X userbot',
    ownerId: process.env.OWNER_WHATSAPP_ID || process.env.BOT_OWNER_ID,
    pairingEnabled: process.env.PAIRING_ENABLED === 'true',
    phoneNumber: process.env.PHONE_NUMBER || '',
    prefix: process.env.COMMAND_PREFIX || '.',

    enableAI: process.env.ENABLE_AI !== 'false',
    enableYouTube: process.env.ENABLE_YOUTUBE !== 'false',
    enableInstagram: process.env.ENABLE_INSTAGRAM !== 'false',
    enablePMProtection: process.env.ENABLE_PM_PROTECTION !== 'false',
    pmWarnLimit: parseInt(process.env.PM_WARN_LIMIT) || 5,

    geminiApiKey: process.env.GEMINI_API_KEY,
    newsApiKey: process.env.NEWS_GEMINI_API_KEY,

    ffmpegPath: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',

    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB) || 50,
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
    enablePMLog: process.env.PM_LOG === 'true',
};

// Config Object Proxy
const config = { ...defaults };

// Function to refresh config from DB
config.refresh = async () => {
    try {
        if (mongoose.connection.readyState !== 1) return;

        // Dynamic Require to avoid circular dependency issues during init
        const Config = require('../models/Config');
        const settings = await Config.find({});

        const keyMap = {
            'BOT_NAME': 'botName',
            'COMMAND_PREFIX': 'prefix',
            'OWNER_WHATSAPP_ID': 'ownerId',
            'ENABLE_AI': 'enableAI',
            'ENABLE_YOUTUBE': 'enableYouTube',
            'ENABLE_INSTAGRAM': 'enableInstagram',
            'GEMINI_API_KEY': 'geminiApiKey',
            'PM_LOG': 'enablePMLog'
        };

        settings.forEach(setting => {
            if (setting.key && setting.value !== undefined && setting.value !== null) {
                const configKey = keyMap[setting.key] || setting.key;
                config[configKey] = setting.value;
            }
        });
        // console.log('Configuration refreshed from Database');
    } catch (error) {
        console.error('Failed to refresh config from DB:', error);
    }
};

module.exports = config;
