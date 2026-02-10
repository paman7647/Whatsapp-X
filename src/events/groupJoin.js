const logger = require('../utils/logger');

module.exports = {
    name: 'group_join',
    async execute(notification, client) {
        try {
            const chat = await notification.getChat();
            const contact = await notification.getContact();

            const { GroupConfig } = require('../models');
            const groupConfig = await GroupConfig.findOne({ groupId: chat.id._serialized });

            if (groupConfig && groupConfig.welcomeMessage) {
                let welcomeText = groupConfig.welcomeMessage;
                // Simple template replacement
                const formattedText = welcomeText
                    .replace(/@user/g, `@${contact.id.user}`)
                    .replace(/@group/g, chat.name)
                    .replace(/\\n/g, '\n'); // Handle escaped newlines

                await chat.sendMessage(formattedText, {
                    mentions: [contact]
                });
                logger.info(`Custom welcome sent in ${chat.name} for ${contact.id.user}`);
            }
        } catch (error) {
            logger.error('Error in group_join event:', error);
        }
    }
};
