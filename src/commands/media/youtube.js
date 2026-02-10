const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../../config/config');
const logger = require('../../utils/logger');
const ytSearch = require('yt-search');
const { checkBinaryAvailability } = require('../../utils/helpers');
const { getProgressBar } = require('../../utils/progressBar');

module.exports = {
    name: 'youtube',
    aliases: ['yt', 'video', 'music', 'song', 'play', 'search'],
    description: 'Download video/audio or search YouTube',
    usage: '<query|url> [-mp3] [-list] [360p|720p]',
    category: 'Media',
    async execute(message, args, client) {
        const startTime = Date.now();
        if (args.length === 0) {
            return message.reply('Please provide a YouTube URL or search term.\n\nUsage:\n`/yt <query>` (Auto Download)\n`/yt <query> -mp3` (Audio)\n`/yt <query> -list` (Search Results)\n`/yt <url> 720p` (Specific Quality)');
        }

        const hasYtDlp = await checkBinaryAvailability('yt-dlp');
        if (!hasYtDlp) {
            return message.reply(' `yt-dlp` is missing.');
        }

        // Parse Flags
        let isAudio = false;
        let isList = false;
        let quality = 'best'; // Default to best compatible

        const argsCopy = [...args];

        // Handle -mp3 / -audio flag
        const mp3Index = argsCopy.findIndex(a => ['-mp3', '-audio', 'mp3'].includes(a));
        if (mp3Index !== -1) {
            isAudio = true;
            argsCopy.splice(mp3Index, 1);
        }

        // Handle -list / -search flag
        const listIndex = argsCopy.findIndex(a => ['-list', '-search', 'search', 'list'].includes(a));
        if (listIndex !== -1) {
            isList = true;
            argsCopy.splice(listIndex, 1);
        }

        // Handle quality (simple check for 360p, 480p, 720p, 1080p)
        const qualityIndex = argsCopy.findIndex(a => ['360p', '480p', '720p', '1080p'].includes(a));
        if (qualityIndex !== -1) {
            quality = argsCopy[qualityIndex].replace('p', '');
            argsCopy.splice(qualityIndex, 1);
        }

        // Check command alias for context
        const cmdUsed = message.body.split(' ')[0].slice(config.prefix.length).toLowerCase();
        if (['music', 'song', 'play'].includes(cmdUsed)) isAudio = true;
        if (['search'].includes(cmdUsed)) isList = true;

        const query = argsCopy.join(' ');

        try {
            // 1. LIST MODE: Search and return links
            if (isList && !query.startsWith('http')) {
                const results = await ytSearch(query);
                if (!results || !results.videos.length) return message.reply(' No results found.');

                let text = ` *YouTube Search Results for "${query}"*\n\n`;
                results.videos.slice(0, 5).forEach((v, i) => {
                    text += `${i + 1}. *${v.title}* (${v.timestamp})\n ${v.url}\n\n`;
                });
                text += `reply with \`/yt <url>\` to download.`;
                return message.reply(text);
            }

            // 2. DOWNLOAD MODE
            let url = query;
            let title = 'YouTube Content';
            let videoId = null;

            // Helper to extract ID
            const extractVideoId = (link) => {
                const match = link.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
                return match ? match[1] : null;
            }

            let statusMsg;

            // Auto-search if not URL
            if (!query.startsWith('http')) {
                statusMsg = await message.reply(` *Searching (${isAudio ? 'Audio' : 'Video'})...*`);
                const results = await ytSearch(query);
                if (!results || !results.videos.length) return statusMsg.edit(' No results found.');
                url = results.videos[0].url;
                title = results.videos[0].title;
                videoId = results.videos[0].videoId;
                await statusMsg.edit(` *Found:* ${title}\n *Processing...*\n\n${getProgressBar(0)}`);
            } else {
                videoId = extractVideoId(url);
                statusMsg = await message.reply(` *Processing ${isAudio ? 'Audio' : 'Video'}...*\n\n${getProgressBar(0)}`);
            }

            const outputDir = path.join(__dirname, '../../../temp');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

            // Deterministic Filename Construction
            const fileSuffix = isAudio ? 'audio' : quality;
            const fileExt = isAudio ? 'mp3' : 'mp4';
            const baseName = videoId ? `yt_${videoId}_${fileSuffix}` : `${Date.now()}_${fileSuffix}`;
            const fileName = `${baseName}.${fileExt}`;
            const filePath = path.join(outputDir, fileName);

            // CACHE HIT CHECK
            if (fs.existsSync(filePath)) {
                const stat = fs.statSync(filePath);
                if (stat.size > 0) {
                    logger.info(`Cache HIT for ${fileName}`);
                    await statusMsg.edit(' *Cache Hit! Sending cached file...*');

                    const sendCachedMedia = async (asDocument = false, useQuote = true) => {
                        let attempts = 0;
                        const deliver = async () => {
                            attempts++;
                            try {
                                logger.info(`Cache Delivery Attempt ${attempts} (Doc: ${asDocument})`);
                                await new Promise(resolve => setTimeout(resolve, 2000));

                                const { MessageMedia } = require('whatsapp-web.js');
                                const media = MessageMedia.fromFilePath(filePath);

                                const options = {
                                    caption: ` *Title:* ${title} (Cached)\n *Time:* ${((Date.now() - startTime) / 1000).toFixed(1)}s\n *Delivered by X-UserBot*`,
                                    sendMediaAsDocument: asDocument,
                                    sendAudioAsVoice: isAudio && !asDocument
                                };

                                if (useQuote) options.quotedMessageId = message.id._serialized;

                                await client.sendMessage(message.remote, media, options);
                                logger.success(`Cache Delivery Successful.`);
                                await statusMsg.edit(` *Sent (Cached):* ${title}`);
                            } catch (e) {
                                const errorMsg = e.message || String(e);
                                const isDetached = errorMsg.includes('detached Frame') || errorMsg.includes('Execution Context Destroyed');

                                if (isDetached && attempts < 3) {
                                    return await deliver(true, attempts === 1);
                                }
                                statusMsg.edit(' Error sending cached file.');
                            }
                        };
                        await deliver();
                    };

                    await sendCachedMedia();
                    return;
                }
            }

            // CACHE MISS - DOWNLOAD
            const ytArgs = [
                '--newline',
                '--progress',
                '--no-playlist',
                '--no-check-certificate',
                '--max-filesize', `${config.maxFileSizeMB}M`,
                '-o', filePath
            ];

            if (isAudio) {
                ytArgs.push('-x', '--audio-format', 'mp3');
                ytArgs.push('-f', 'ba/b');
            } else {
                if (quality === 'best') {
                    ytArgs.push('-f', 'bv*[height<=480][vcodec^=avc1]+ba[acodec^=mp4a]/b[ext=mp4]/b');
                } else {
                    ytArgs.push('-f', `bv*[height<=${quality}][vcodec^=avc1]+ba[acodec^=mp4a]/b[ext=mp4]/b`);
                }
            }

            ytArgs.push(url);

            const ytDlpProcess = spawn('yt-dlp', ytArgs);
            let lastUpdate = 0;

            ytDlpProcess.stdout.on('data', (data) => {
                const output = data.toString();
                const match = output.match(/\[download\]\s+(\d+\.\d+)%/);
                if (match) {
                    const percentage = parseFloat(match[1]);
                    const now = Date.now();
                    if (now - lastUpdate > 2000) {
                        statusMsg.edit(`${isAudio ? '' : ''} *Downloading YouTube Content...*\n\n${getProgressBar(percentage)}`).catch(() => { });
                        lastUpdate = now;
                    }
                }
            });

            ytDlpProcess.on('close', async (code) => {
                if (code !== 0) return statusMsg.edit(' Download failed.');

                if (!fs.existsSync(filePath)) return statusMsg.edit(' File not found after download.');

                // Size Check
                const stat = fs.statSync(filePath);
                if (stat.size > config.maxFileSizeMB * 1024 * 1024) {
                    fs.unlinkSync(filePath);
                    return statusMsg.edit(' File too large for WhatsApp.');
                }

                await statusMsg.edit(' *Uploading to WhatsApp...*');

                let attempts = 0;
                const sendMedia = async (asDocument = false, useQuote = true) => {
                    attempts++;
                    try {
                        logger.info(`Attempt ${attempts}: Sending media (Doc: ${asDocument}, Quote: ${useQuote})`);
                        await new Promise(resolve => setTimeout(resolve, 5000));

                        const { MessageMedia } = require('whatsapp-web.js');
                        if (!fs.existsSync(filePath)) throw new Error('File disappeared');

                        const media = MessageMedia.fromFilePath(filePath);
                        const options = {
                            caption: ` *Title:* ${title}\n *Time:* ${((Date.now() - startTime) / 1000).toFixed(1)}s\n *Delivered by X-UserBot*`,
                            sendMediaAsDocument: asDocument,
                            sendAudioAsVoice: isAudio && !asDocument
                        };

                        if (useQuote) options.quotedMessageId = message.id._serialized;

                        await client.sendMessage(message.remote, media, options);
                        logger.success(`Attempt ${attempts}: Delivery successful.`);
                        await statusMsg.edit(` *Sent:* ${title}`);
                    } catch (e) {
                        const errorMsg = e.message || String(e);
                        const isDetached = errorMsg.includes('detached Frame') ||
                            errorMsg.includes('Execution Context Destroyed') ||
                            errorMsg === 't' ||
                            errorMsg.includes('t: t');

                        if (isDetached && attempts < 3) {
                            return await sendMedia(true, attempts === 1);
                        }
                        logger.error('YouTube Send Error:', e);
                        statusMsg.edit(' Error sending file.');
                    }
                };

                await sendMedia();
            });

        } catch (error) {
            logger.error(error);
            message.reply(' Error processing request.');
        }
    }
};
