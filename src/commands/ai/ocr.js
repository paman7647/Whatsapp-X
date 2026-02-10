const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ocr',
    description: 'Extract text from an image',
    usage: '(reply to image)',
    category: 'AI',
    async execute(message, args, client) {
        let media;

        if (message.hasMedia) {
            media = await message.downloadMedia();
        } else if (message.hasQuotedMsg) {
            const quoted = await message.getQuotedMessage();
            if (quoted.hasMedia) {
                media = await quoted.downloadMedia();
            }
        }

        if (!media || !media.mimetype.startsWith('image/')) {
            return message.reply(' Please reply to an image with `/ocr`.');
        }

        await message.reply(' *Extracting text...*');

        try {
            const buffer = Buffer.from(media.data, 'base64');
            const { data: { text } } = await Tesseract.recognize(buffer, 'eng');

            if (!text.trim()) {
                await message.reply(' No text detected.');
            } else {
                await message.reply(`* Extracted Text:*\n\n${text.trim()}`);
            }
        } catch (error) {
            console.error(error);
            message.reply(' OCR failed.');
        }
    }
};
