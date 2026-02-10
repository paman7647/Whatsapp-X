const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const logger = require('./logger');

/**
 * Validates the existence and version of critical binaries asynchronously
 */
async function runHealthCheck() {
    logger.info(' Starting Environment Health Check...');

    const binaries = [
        { name: 'Node.js', command: 'node -v', critical: true },
        { name: 'FFmpeg', command: 'ffmpeg -version', critical: true },
        { name: 'Python3', command: 'python3 --version', critical: false },
        { name: 'yt-dlp', command: 'yt-dlp --version', critical: true }
    ];

    let allOk = true;

    // Run checks in parallel
    const checkPromises = binaries.map(async (bin) => {
        try {
            const { stdout } = await execAsync(bin.command);
            const version = stdout.toString().split('\n')[0];
            logger.success(` ${bin.name} found: ${version}`);
            return true;
        } catch (error) {
            if (bin.critical) {
                logger.error(` CRITICAL: ${bin.name} is missing or broken!`);
                return false;
            } else {
                logger.warn(` Warning: ${bin.name} not found. Some features may fail.`);
                return true;
            }
        }
    });

    const results = await Promise.all(checkPromises);
    if (results.includes(false)) allOk = false;

    // Check MongoDB Connection (Only warning if no MONGODB_URI)
    if (!process.env.MONGODB_URI && !allOk) {
        // Logic adjustment: only warn if relevant, but here we just check env
        logger.warn('Warning: MONGODB_URI not found. RemoteAuth will fail.');
    }

    if (!allOk) {
        logger.error(' Environment check FAILED. Please run the appropriate install script (install.sh or install.ps1)');
        process.exit(1);
    }

    logger.success(' Environment is ready for X-UserBot!');
}

module.exports = { runHealthCheck };
