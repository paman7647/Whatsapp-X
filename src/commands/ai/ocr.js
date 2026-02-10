const { spawn } = require('child_process');
const sharp = require('sharp');
const logger = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ocr',
    aliases: ['extract', 'read'],
    description: 'Extract text using high-accuracy Python AI engine (Offline)',
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

        const statusMsg = await message.reply('🔍 *Python AI: Extracting text (Fast)...*');

        try {
            const buffer = Buffer.from(media.data, 'base64');
            const tempDir = path.join(process.cwd(), 'data/temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const tempPath = path.join(tempDir, `ocr_${Date.now()}.png`);

            // Step 1: Pre-process with Sharp for maximum contrast
            await sharp(buffer)
                .rotate()
                .resize(1200)
                .grayscale()
                .normalize()
                .toFile(tempPath);

            // Step 2: Call Python Bridge
            const pythonScript = path.join(__dirname, '../../scripts/ocr_engine.py');

            const pythonProcess = spawn('python3', [pythonScript, tempPath]);
            let extractedText = '';
            let errorText = '';

            pythonProcess.stdout.on('data', (data) => {
                extractedText += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorText += data.toString();
            });

            pythonProcess.on('close', async (code) => {
                // Cleanup temp file
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

                if (code !== 0) {
                    logger.error(`Python OCR Error: ${errorText}`);
                    return await statusMsg.edit('❌ AI Error: Python bridge failed. Ensure EasyOCR is installed.');
                }

                if (!extractedText.trim()) {
                    await statusMsg.edit('❌ No text detected by the Python engine.');
                } else {
                    await statusMsg.edit(`✅ *Extracted Text (Python AI):*\n\n${extractedText.trim()}`);
                }
            });

        } catch (error) {
            logger.error('OCR Bridge Error:', error);
            await statusMsg.edit('❌ OCR failed. Ensure your Ubuntu environment is set up correctly.');
        }
    }
};
