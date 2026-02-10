const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const { checkBinaryAvailability, getMediaTitle } = require('../../utils/helpers');
const { getProgressBar } = require('../../utils/progressBar');

module.exports = {
    name: 'twitter',
    aliases: ['x', 'twt'],
    description: 'Download Twitter/X video/image',
    usage: '<url>',
    category: 'Media',
    async execute(message, args, client) {
        const startTime = Date.now();
        if (args.length === 0) {
            return message.reply('Please provide a Twitter/X URL.');
        }

        const url = args[0];
        const statusMsg = await message.reply(' *Fetching Twitter content...*\n\n' + getProgressBar(0));

        const outputDir = path.join(__dirname, '../../../temp');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const timestamp = Date.now();
        const outputPath = path.join(outputDir, `${timestamp}_%(id)s.%(ext)s`);

        const ytDlpProcess = spawn('yt-dlp', [
            '--newline',
            '--progress',
            '-o', outputPath,
            '--max-filesize', `${config.maxFileSizeMB}M`,
            '--no-playlist',
            '--no-check-certificate',
            url
        ]);

        let lastUpdate = 0;
        ytDlpProcess.stdout.on('data', (data) => {
            const output = data.toString();
            const match = output.match(/\[download\]\s+(\d+\.\d+)%/);
            if (match) {
                const percentage = parseFloat(match[1]);
                const now = Date.now();
                if (now - lastUpdate > 1500) {
                    statusMsg.edit(` *Fetching Twitter content...*\n\n${getProgressBar(percentage)}`).catch(() => { });
                    lastUpdate = now;
                }
            }
        });

        ytDlpProcess.on('close', async (code) => {
            if (code !== 0) {
                await statusMsg.edit(' Download failed.');
                return;
            }

            const files = fs.readdirSync(outputDir);
            const match = files.find(f => f.startsWith(`${timestamp}_`));

            if (!match) {
                await statusMsg.edit(' File not found.');
                return;
            }

            const filePath = path.join(outputDir, match);

            // Size Check
            const stat = fs.statSync(filePath);
            if (stat.size > config.maxFileSizeMB * 1024 * 1024) {
                fs.unlinkSync(filePath);
                await statusMsg.edit(` File too large. Limit is ${config.maxFileSizeMB}MB.`);
                return;
            }

            try {
                const { MessageMedia } = require('whatsapp-web.js');
                await statusMsg.edit(' *Uploading to WhatsApp...*');

                let attempts = 0;
                const sendMedia = async (asDocument = false, useQuote = true) => {
                    attempts++;
                    try {
                        logger.info(`Twitter Attempt ${attempts}: Sending (Doc: ${asDocument}, Quote: ${useQuote})`);
                        await new Promise(resolve => setTimeout(resolve, 3000)); // Stability delay

                        if (!fs.existsSync(filePath)) throw new Error('File disappeared');

                        const media = MessageMedia.fromFilePath(filePath);
                        const title = await getMediaTitle(url);
                        const options = {
                            caption: ` *Title:* ${title}\n *Time:* ${((Date.now() - startTime) / 1000).toFixed(1)}s\n *Delivered by X-UserBot*`,
                            sendMediaAsDocument: asDocument
                        };

                        if (useQuote) options.quotedMessageId = message.id._serialized;

                        await client.sendMessage(message.remote, media, options);
                        logger.success(`Twitter Attempt ${attempts}: Success.`);
                        await statusMsg.delete(true).catch(() => { });
                    } catch (error) {
                        const errorMsg = error.message || String(error);
                        const isRetriable = errorMsg.includes('detached Frame') || errorMsg.includes('Execution Context Destroyed');

                        if (isRetriable && attempts < 3) {
                            return await sendMedia(true, attempts === 1);
                        }
                        logger.error('Twitter Send Error:', error);
                        await statusMsg.edit(' Failed to send media.');
                    }
                };

                await sendMedia();
            } catch (error) {
                logger.error('Twitter Exec Error:', error);
            } finally {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        });
    }
};
