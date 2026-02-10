const QRCode = require('qrcode');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'qr',
    description: 'Generate a QR code',
    usage: '<text|url>',
    async execute(message, args, client) {
        if (args.length === 0) {
            return message.reply('Please provide text or URL for the QR code.');
        }

        const text = args.join(' ');

        try {
            const url = await QRCode.toDataURL(text);
            const base64Data = url.split(',')[1];

            const media = new MessageMedia('image/png', base64Data);
            await message.reply(media, undefined, { caption: 'Here is your QR Code! ' });
        } catch (error) {
            console.error(error);
            message.reply(' Failed to generate QR code.');
        }
    }
};
