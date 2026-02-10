const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker'],
    description: 'Convert image/video/gif to sticker',
    usage: '(reply to media)',
    async execute(message, args, client) {
        let media = null;
        let msgToProcess = message;

        // Check if message has media
        if (message.hasMedia) {
            media = await message.downloadMedia();
        }
        // Check quoted message
        else if (message.hasQuotedMsg) {
            msgToProcess = await message.getQuotedMessage();
            if (msgToProcess.hasMedia) {
                media = await msgToProcess.downloadMedia();
            }
        }

        if (!media) {
            return message.reply(' Please reply to an image, video, or GIF with `/sticker`.');
        }

        try {
            await message.reply(media, undefined, {
                sendMediaAsSticker: true,
                stickerAuthor: client.info.pushname || 'X Bot',
                stickerName: 'Created by X Bot'
            });
        } catch (error) {
            console.error('Error creating sticker:', error);
            message.reply(' Failed to create sticker. The file might be too large or incompatible.');
        }
    }
};
