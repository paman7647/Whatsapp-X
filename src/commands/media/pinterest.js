const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const { getMediaTitle } = require('../../utils/helpers');
const { getProgressBar } = require('../../utils/progressBar');

module.exports = {
    name: 'pinterest',
    aliases: ['pin'],
    description: 'Download Pinterest image/video',
    usage: '<url>',
    category: 'Media',
    async execute(message, args, client) {
        const startTime = Date.now();
        if (args.length === 0) {
            return message.reply('Please provide a Pinterest URL.');
        }

        const url = args[0];
        const statusMsg = await message.reply(' *Processing Pin...*\n\n' + getProgressBar(0));

        const outputDir = path.join(__dirname, '../../../temp');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const timestamp = Date.now();
        const outputPath = path.join(outputDir, `${timestamp}_%(id)s.%(ext)s`);

        const ytArgs = [
            '--newline',
            '--progress',
            '--no-playlist',
            '--no-check-certificate',
            '--geo-bypass',
            '-o', outputPath,
            '--max-filesize', `${config.maxFileSizeMB}M`,
            url
        ];

        const ytDlpProcess = spawn('yt-dlp', ytArgs);

        let lastUpdate = 0;
        ytDlpProcess.stdout.on('data', (data) => {
            const output = data.toString();
            const match = output.match(/\[download\]\s+(\d+\.\d+)%/);
            if (match) {
                const percentage = parseFloat(match[1]);
                const now = Date.now();
                if (now - lastUpdate > 2000) {
                    statusMsg.edit(` *Downloading Pin...*\n\n${getProgressBar(percentage)}`).catch(() => { });
                    lastUpdate = now;
                }
            }
        });

        ytDlpProcess.stderr.on('data', (data) => {
            logger.error(`yt-dlp Pinterest Error: ${data}`);
        });

        ytDlpProcess.on('close', async (code) => {
            if (code !== 0) {
                await statusMsg.edit(' Download failed. Make sure the link is valid and public.');
                return;
            }

            const files = fs.readdirSync(outputDir);
            const matchFile = files.find(f => f.startsWith(`${timestamp}_`));

            if (!matchFile) {
                await statusMsg.edit(' File not found after extraction.');
                return;
            }

            const filePath = path.join(outputDir, matchFile);
            const stat = fs.statSync(filePath);

            if (stat.size > config.maxFileSizeMB * 1024 * 1024) {
                fs.unlinkSync(filePath);
                await statusMsg.edit(` File exceeds the size limit (${config.maxFileSizeMB}MB).`);
                return;
            }

            try {
                const { MessageMedia } = require('whatsapp-web.js');
                await statusMsg.edit(' *Uploading...*');

                const media = MessageMedia.fromFilePath(filePath);
                const title = await getMediaTitle(url).catch(() => 'Pinterest Media');

                const deliver = async (asDocument = false) => {
                    try {
                        await client.sendMessage(message.remote, media, {
                            caption: ` *Title:* ${title}\n *Time:* ${((Date.now() - startTime) / 1000).toFixed(1)}s\n *Delivered by X-UserBot*`,
                            sendMediaAsDocument: asDocument,
                            quotedMessageId: message.id._serialized
                        });
                        await statusMsg.delete(true).catch(() => { });
                    } catch (e) {
                        if (!asDocument) return deliver(true);
                        logger.error('Pinterest Delivery Failed:', e);
                        await statusMsg.edit(' Final delivery attempt failed.');
                    }
                };

                await deliver();
            } catch (error) {
                logger.error('Pinterest Process Error:', error);
                await statusMsg.edit(' Error processing the file.');
            } finally {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        });
    }
};
