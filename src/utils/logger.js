const moment = require('moment-timezone');

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
};

function getTimestamp() {
    return moment().format('HH:mm:ss');
}

const logger = {
    info: (message) => {
        console.log(`${colors.blue}ℹ️ [INFO] ${getTimestamp()} - ${message}${colors.reset}`);
    },
    success: (message) => {
        console.log(`${colors.green}✅ [SUCCESS] ${getTimestamp()} - ${message}${colors.reset}`);
    },
    warn: (message) => {
        console.warn(`${colors.yellow}⚠️ [WARN] ${getTimestamp()} - ${message}${colors.reset}`);
    },
    error: (message, error = '') => {
        console.error(`${colors.red}❌ [ERROR] ${getTimestamp()} - ${message}${colors.reset}`, error);
    },
    debug: (message) => {
        if (process.env.DEBUG === 'true') {
            console.log(`${colors.magenta}🐛 [DEBUG] ${getTimestamp()} - ${message}${colors.reset}`);
        }
    }
};

module.exports = logger;
