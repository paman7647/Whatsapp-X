const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../../config/config');
const { checkBinaryAvailability, getPlatformInstallInstructions, getMediaTitle } = require('../../utils/helpers');
const { getProgressBar } = require('../../utils/progressBar');
const logger = require('../../utils/logger');

// Note: Spotify download effectively uses yt-dlp to find the song on YouTube Music
module.exports = {
    name: 'spotify',
    aliases: ['spot', 'spotifydl'],
    description: 'Download music from Spotify',
    usage: '<url>',
    async execute(message, args, client) {
        const startTime = Date.now();
        if (args.length === 0) {
            return message.reply('Please provide a Spotify URL.');
        }

        const url = args[0];

        // Basic validation
        if (!url.includes('spotify.com')) {
            return message.reply(' Invalid Spotify URL.');
        }

        const hasYtDlp = await checkBinaryAvailability('yt-dlp');
        if (!hasYtDlp) {
            const instructions = getPlatformInstallInstructions('yt-dlp');
            return message.reply(` **Missing Dependency**\n\n\`yt-dlp\` is not installed.\n${instructions}`);
        }

        const statusMsg = await message.reply(' *Downloading music...*\n\n' + getProgressBar(0));

        const outputDir = path.join(__dirname, '../../../temp');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const timestamp = Date.now();
        const outputPath = path.join(outputDir, `${timestamp}_%(title)s.%(ext)s`);

        const ytDlpProcess = spawn('yt-dlp', [
            '--newline',
            '--progress',
            '-f', 'ba', // Audio only
            '-x', // Extract audio
            '--audio-format', 'mp3',
            '-o', outputPath,
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
                    statusMsg.edit(` *Downloading music...*\n\n${getProgressBar(percentage)}`).catch(() => { });
                    lastUpdate = now;
                }
            }
        });

        ytDlpProcess.on('close', async (code) => {
            if (code !== 0) {
                await statusMsg.edit(' Download failed. The link might be unsupported or region-locked.');
                return;
            }

            const files = fs.readdirSync(outputDir);
            const match = files.find(f => f.startsWith(`${timestamp}_`));

            if (match) {
                const filePath = path.join(outputDir, match);
                try {
                    const { MessageMedia } = require('whatsapp-web.js');
                    await statusMsg.edit(' *Uploading to WhatsApp...*');

                    const media = MessageMedia.fromFilePath(filePath);

                    const title = await getMediaTitle(url);
                    await client.sendMessage(message.remote, media, {
                        caption: ` *Title:* ${title}\n *Time:* ${((Date.now() - startTime) / 1000).toFixed(1)}s\n *Delivered by X-UserBot*`,
                        quotedMessageId: message.id._serialized,
                        sendAudioAsVoice: true
                    });

                    await statusMsg.delete(true).catch(() => { });
                } catch (error) {
                    logger.error('Spotify Send Error:', error);
                    await statusMsg.edit(' Failed to send media.');
                } finally {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
            } else {
                await statusMsg.edit(' File not found.');
            }
        });
    }
};
