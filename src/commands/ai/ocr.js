const pythonBridge = require('../../services/pythonBridge');
const sharp = require('sharp');
const logger = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ocr',
    aliases: ['extract', 'read'],
    description: 'Extract text using high-accuracy Python AI engine (EasyOCR)',
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

        const statusMsg = await message.reply('🔍 *Python AI: Extracting text (EasyOCR)...*');

        try {
            const buffer = Buffer.from(media.data, 'base64');
            const tempDir = path.join(process.cwd(), 'data/temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `ocr_${Date.now()}.png`);

            // Pre-process for better accuracy
            await sharp(buffer)
                .rotate()
                .resize(1200)
                .grayscale()
                .normalize()
                .toFile(tempPath);

            // Call unified bridge
            const result = await pythonBridge.call('ocr_suite.py', 'extract_text', {
                image_path: tempPath
            });

            // Cleanup
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

            if (result.status === 'error' || typeof result === 'string' && result.includes('Error')) {
                return await statusMsg.edit(`❌ ${result.message || result}`);
            }

            const text = result.data || result;
            if (!text.trim()) {
                await statusMsg.edit('❌ No text detected by the Python engine.');
            } else {
                await statusMsg.edit(`✅ *Extracted Text (Python AI):*\n\n${text.trim()}`);
            }

        } catch (error) {
            logger.error('OCR Extraction Error:', error);
            await statusMsg.edit('❌ OCR failed. Ensure Python dependencies are installed.');
        }
    }
};
