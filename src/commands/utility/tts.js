const googleTTS = require('google-tts-api'); // Need to install or use alternative

module.exports = {
    name: 'tts',
    aliases: ['speak', 'say'],
    category: 'Utility',
    description: 'Text to Speech',
    usage: '<lang> <text> (e.g. .tts en Hello)',
    async execute(message, args, client) {
        let lang = 'en';
        let text = args.join(' ');

        if (args.length > 1 && args[0].length === 2) {
            lang = args[0];
            text = args.slice(1).join(' ');
        }

        if (!text) return message.reply('⚠️ Usage: .tts <lang> <text>');

        try {
            // Get base64 audio
            const url = googleTTS.getAudioUrl(text, {
                lang: lang,
                slow: false,
                host: 'https://translate.google.com',
            });

            // This returns a URL. MessageMedia can fetch from URL.
            const { MessageMedia } = require('whatsapp-web.js');
            const media = await MessageMedia.fromUrl(url, { unsafeMime: true });

            await message.reply(media);

        } catch (error) {
            console.error('TTS error:', error);
            await message.reply('❌ Failed to generate audio.');
        }
    }
};
