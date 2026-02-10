const logger = require('../utils/logger');
const config = require('../config/config');

module.exports = {
    name: 'ready',
    async execute(client) {
        logger.success(`${config.botName} is ready!`);
        logger.info(`Owner ID: ${config.ownerId}`);

        // Initialize DB configs
        try {
            const initializeDefaultConfigs = require('../config/setup');
            await initializeDefaultConfigs();
            logger.success('Default configurations initialized');
        } catch (error) {
            logger.error('Failed to initialize default configs:', error);
        }
    }
};
