const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const { checkBinaryAvailability, getMediaTitle } = require('../../utils/helpers');
const { getProgressBar } = require('../../utils/progressBar');

function getInstagramHeaders() {
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
    };
}

module.exports = {
    name: 'instagram',
    aliases: ['ig', 'insta', 'reel'],
    description: 'Download Instagram posts/reels',
    usage: '<url>',
    category: 'Media',
    async execute(message, args, client) {
        const startTime = Date.now();
        const url = args.find(arg => arg.includes('instagram.com/'));

        if (!url) {
            return message.reply(' Invalid Instagram URL. Please provide a valid link (Post, Reel, or TV).');
        }

        const statusMsg = await message.reply(' *Downloading Instagram content...*\n\n' + getProgressBar(0));

        const outputDir = path.join(__dirname, '../../../temp');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const filename = `ig_${Date.now()}.mp4`;
        const outputPath = path.join(outputDir, filename);

        try {
            const hasYtDlp = await checkBinaryAvailability('yt-dlp');
            if (!hasYtDlp) throw new Error('yt-dlp missing');

            // Use yt-dlp as primary method
            const ytDlp = spawn('yt-dlp', [
                '--newline',
                '--progress',
                '-o', outputPath,
                '-f', 'bv*[vcodec^=avc1]+ba[acodec^=mp4a]/b[ext=mp4]/b',
                '--max-filesize', `${config.maxFileSizeMB}M`,
                '--no-playlist',
                '--merge-output-format', 'mp4',
                '--no-warnings',
                url
            ]);

            let lastUpdate = 0;
            ytDlp.stdout.on('data', (data) => {
                const output = data.toString();
                const match = output.match(/\[download\]\s+(\d+\.\d+)%/);
                if (match) {
                    const percentage = parseFloat(match[1]);
                    const now = Date.now();
                    if (now - lastUpdate > 1500) {
                        statusMsg.edit(` *Downloading Instagram content...*\n\n${getProgressBar(percentage)}`).catch(() => { });
                        lastUpdate = now;
                    }
                }
            });

            ytDlp.on('close', async (code) => {
                if (code !== 0) {
                    return await this.fallbackToAPI(message, url, statusMsg, client, startTime);
                }

                if (fs.existsSync(outputPath)) {
                    await statusMsg.edit(' *Uploading to WhatsApp...*');

                    let attempts = 0;
                    const sendMedia = async (asDocument = false, useQuote = true) => {
                        attempts++;
                        try {
                            logger.info(`IG Attempt ${attempts}: Sending (Doc: ${asDocument}, Quote: ${useQuote})`);
                            await new Promise(resolve => setTimeout(resolve, 5000));

                            if (!fs.existsSync(outputPath)) throw new Error('File disappeared');

                            const media = MessageMedia.fromFilePath(outputPath);
                            if (!media) throw new Error('Failed to load media');

                            const title = await getMediaTitle(url);
                            const options = {
                                caption: ` *Title:* ${title}\n *Time:* ${((Date.now() - startTime) / 1000).toFixed(1)}s\n *Delivered by X-UserBot*`,
                                sendMediaAsDocument: asDocument
                            };

                            if (useQuote) options.quotedMessageId = message.id._serialized;

                            await client.sendMessage(message.remote, media, options);
                            logger.success(`IG Attempt ${attempts}: Success.`);
                        } catch (sendError) {
                            const errorMsg = sendError.message || String(sendError);
                            const isDetached = errorMsg.includes('detached Frame') ||
                                errorMsg.includes('Execution Context Destroyed') ||
                                errorMsg === 't' ||
                                errorMsg.includes('t: t');

                            if (isDetached && attempts < 3) {
                                return await sendMedia(true, attempts === 1);
                            }

                            logger.error('Instagram Send Error:', sendError);
                            await statusMsg.edit(' Error sending video.');
                        }
                    };

                    try {
                        await sendMedia();
                    } finally {
                        if (fs.existsSync(outputPath)) {
                            setTimeout(() => {
                                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                            }, 5000);
                        }
                    }
                } else {
                    await this.fallbackToAPI(message, url, statusMsg, client, startTime);
                }
            });

        } catch (error) {
            logger.warn('yt-dlp failed, trying API fallback:', error.message);
            await this.fallbackToAPI(message, url, statusMsg, client, startTime);
        }
    },

    async fallbackToAPI(message, url, statusMsg, client, startTime) {
        try {
            await statusMsg.edit(' *Yt-dlp failed. Using API fallback...*');
            let instagramGetUrl;
            try {
                instagramGetUrl = require('instagram-url-direct').default || require('instagram-url-direct');
            } catch (e) {
                return statusMsg.edit(' Download failed. Direct API and yt-dlp are unavailable.');
            }

            const results = await instagramGetUrl(url);
            if (results.url_list && results.url_list.length > 0) {
                const mediaUrl = results.url_list[0];
                const media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime: true });
                await statusMsg.edit(' *Uploading via API fallback...*');

                await client.sendMessage(message.remote, media, {
                    caption: ` *Title:* Instagram Content\n *Time:* ${((Date.now() - startTime) / 1000).toFixed(1)}s\n *Delivered by X-UserBot*`,
                    quotedMessageId: message.id._serialized
                });
                await statusMsg.edit(' *Sent via API fallback!*');
            } else {
                await statusMsg.edit(' Unable to find media in this Instagram link.');
            }
        } catch (apiError) {
            logger.error('Instagram API Error:', apiError);
            if (statusMsg) await statusMsg.edit(' Failed to download from Instagram.');
        }
    }
};
