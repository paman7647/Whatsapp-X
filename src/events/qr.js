const qrcode = require('qrcode-terminal');
const logger = require('../utils/logger');

module.exports = {
    name: 'qr',
    execute(qr) {
        logger.info('QR RECEIVED');
        qrcode.generate(qr, { small: true });
    }
};
