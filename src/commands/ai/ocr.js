const tesseract = require('node-tesseract-ocr');
const sharp = require('sharp');
const logger = require('../../utils/logger');

// Tesseract Configuration for Native Engine
const tesseractConfig = {
    lang: "eng+kan", // Support English and Kannada natively
    oem: 1,         // Neural nets LSTM engine only
    psm: 3,         // Fully automatic page segmentation, but no OSD
};

module.exports = {
    name: 'ocr',
    aliases: ['extract', 'read'],
    description: 'Extract text using high-performance native engine (Offline)',
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
            return message.reply('❌ Please reply to an image with `/ocr` to extract text.');
        }

        const statusMsg = await message.reply('🔍 *Native Engine: Processing image...*');

        try {
            const buffer = Buffer.from(media.data, 'base64');

            // Step 1: Image Preprocessing with Sharp
            const processedBuffer = await sharp(buffer)
                .rotate()
                .resize(1500)
                .grayscale()
                .normalize()
                .sharpen()
                .toBuffer();

            // Step 2: Recognition using Native System Binary
            logger.info('OCR: Executing native tesseract binary...');
            const text = await tesseract.recognize(processedBuffer, tesseractConfig);

            if (!text || !text.trim()) {
                await statusMsg.edit('❌ No text detected by the native engine.');
            } else {
                await statusMsg.edit(`✅ *Extracted Text (Native Offline):*\n\n${text.trim()}`);
            }

        } catch (error) {
            logger.error('Native OCR Error:', error);
            if (error.message && (error.message.includes('NOT_FOUND') || error.message.includes('ENOENT'))) {
                await statusMsg.edit('❌ Native OCR engine not found. Please run the setup script to install Tesseract.');
            } else {
                await statusMsg.edit('❌ OCR processing failed. Try with a clearer image.');
            }
        }
    }
};

