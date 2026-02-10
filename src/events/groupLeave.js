const logger = require('../utils/logger');

module.exports = {
    name: 'group_leave',
    async execute(notification, client) {
        try {
            const chat = await notification.getChat();
            const contact = await notification.getContact();

            const { GroupConfig } = require('../models');
            const groupConfig = await GroupConfig.findOne({ groupId: chat.id._serialized });

            if (groupConfig && groupConfig.goodbyeMessage) {
                let goodbyeText = groupConfig.goodbyeMessage;
                const formattedText = goodbyeText
                    .replace(/@user/g, `@${contact.id.user}`)
                    .replace(/@group/g, chat.name)
                    .replace(/\\n/g, '\n');

                await chat.sendMessage(formattedText, {
                    mentions: [contact]
                });
                logger.info(`Custom goodbye sent in ${chat.name} for ${contact.id.user}`);
            }

            logger.info(`User left group: ${chat.name}`);
        } catch (error) {
            logger.error('Error in group_leave event:', error);
        }
    }
};
