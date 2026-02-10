const pythonBridge = require('../../services/pythonBridge');
const logger = require('../../utils/logger');
const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'removebg',
    aliases: ['rbg', 'nobg'],
    description: 'Remove image background (Python AI)',
    usage: '(reply to image)',
    category: 'Media',
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
            return message.reply('❌ Please reply to an image with `/removebg`.');
        }

        const statusMsg = await message.reply('✨ *AI: Removing background...*');

        try {
            const tempDir = path.join(process.cwd(), 'data/temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const inputPath = path.join(tempDir, `rbg_in_${Date.now()}.png`);
            const outputPath = path.join(tempDir, `rbg_out_${Date.now()}.png`);

            // Save input image
            fs.writeFileSync(inputPath, Buffer.from(media.data, 'base64'));

            const result = await pythonBridge.call('media_suite.py', 'remove_bg', {
                input_path: inputPath,
                output_path: outputPath
            });

            if (result.status === 'error') {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                return await statusMsg.edit(`❌ ${result.message}`);
            }

            // Send processed image
            const resultMedia = MessageMedia.fromFilePath(outputPath);
            await client.sendMessage(message.from, resultMedia, { caption: '✅ Background removed!' });
            await statusMsg.delete(true);

            // Cleanup
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

        } catch (error) {
            logger.error('RemoveBG Error:', error);
            await statusMsg.edit('❌ Failed to remove background. Ensure `rembg` is installed in your Python environment.');
        }
    }
};
