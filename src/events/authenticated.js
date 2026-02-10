const logger = require('../utils/logger');

module.exports = {
    name: 'authenticated',
    execute() {
        logger.success('Client authenticated successfully!');
    }
};
