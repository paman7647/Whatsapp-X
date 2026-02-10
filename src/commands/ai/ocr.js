
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const logger = require('../../utils/logger');

module.exports = {
    name: 'ocr',
    aliases: ['extract', 'read'],
    description: 'Extract text from an image locally (No AI)',
    usage: '(reply to image)',
    category: 'AI',
    async execute(message, args, client) {
        let media;

        // Find media from current or quoted message
        if (message.hasMedia) {
            media = await message.downloadMedia();
        } else if (message.hasQuotedMsg) {
            const quoted = await message.getQuotedMessage();
            if (quoted.hasMedia) {
                media = await quoted.downloadMedia();
            }
        }

        if (!media || !media.mimetype.startsWith('image/')) {
            return message.reply('❌ Please reply to an image with `/ ocr` to extract text.');
        }

        const statusMsg = await message.reply('🔍 *Local OCR: Processing image...*');

        try {
            const buffer = Buffer.from(media.data, 'base64');

            // Image Preprocessing: Grayscale and Sharpen for better Tesseract accuracy
            const processedBuffer = await sharp(buffer)
                .grayscale()
                .normalize()
                .toBuffer();

            // Run Tesseract with English and Kannada support
            const { data: { text } } = await Tesseract.recognize(processedBuffer, 'eng+kan', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        // Optional: can send progress updates if needed
                    }
                }
            });

            if (!text.trim()) {
                await statusMsg.edit('❌ No text detected in the image.');
            } else {
                await statusMsg.edit(`✅ * Extracted Text(Local):*\n\n${text.trim()} `);
            }

        } catch (error) {
            logger.error('Local OCR Error:', error);
            await statusMsg.edit('❌ Local OCR failed. Ensure the image is clear.');
        }
    }
};

