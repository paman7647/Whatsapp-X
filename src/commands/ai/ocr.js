const { GoogleGenAI } = require('@google/genai');
const Tesseract = require('tesseract.js');
const config = require('../../config/config');
const logger = require('../../utils/logger');

// Initialize Gemini client
const genAI = new GoogleGenAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

module.exports = {
    name: 'ocr',
    aliases: ['extract', 'read'],
    description: 'Extract text from an image with high accuracy using AI',
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

        const statusMsg = await message.reply('🔍 *Processing image with AI...*');

        try {
            // Attempt Gemini Vision first (Superior accuracy & Support for Kannada/Hindi/etc.)
            if (config.geminiApiKey) {
                const result = await model.generateContent([
                    "Extract all text from this image exactly as it appears. If there is text in multiple languages (like English and Kannada), extract both. Return only the extracted text without any commentary.",
                    {
                        inlineData: {
                            data: media.data,
                            mimeType: media.mimetype
                        }
                    }
                ]);

                const text = result.response.text();

                if (text && text.trim()) {
                    return await statusMsg.edit(`✅ *Extracted Text (Gemini AI):*\n\n${text.trim()}`);
                }
            }

            // Fallback to Tesseract if Gemini fails or key is missing
            logger.info('OCR: Falling back to Tesseract...');
            await statusMsg.edit('🔍 *AI fallback: Running local OCR engine...*');

            const buffer = Buffer.from(media.data, 'base64');
            const { data: { text } } = await Tesseract.recognize(buffer, 'eng+kan'); // Added Kannada support to Tesseract too

            if (!text.trim()) {
                await statusMsg.edit('❌ No text detected in the image.');
            } else {
                await statusMsg.edit(`✅ *Extracted Text (Local Engine):*\n\n${text.trim()}`);
            }

        } catch (error) {
            logger.error('OCR Process Error:', error);
            await statusMsg.edit('❌ OCR failed. Please ensure your image is clear or try again later.');
        }
    }
};
