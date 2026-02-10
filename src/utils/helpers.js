const { spawn } = require('child_process');
const config = require('../config/config');

const PLATFORM = process.platform;
const IS_WINDOWS = process.platform === 'win32';

// State maps
const rateLimitMap = new Map();
const cache = new Map();

// Helper Functions

function checkRateLimit(userId, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const userLimits = rateLimitMap.get(userId) || [];
    const recentRequests = userLimits.filter(time => now - time < windowMs);
    if (recentRequests.length >= limit) {
        return false;
    }
    recentRequests.push(now);
    rateLimitMap.set(userId, recentRequests);
    return true;
}

function getCached(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < (cached.ttl || 3600000)) {
        return cached.data;
    }
    cache.delete(key);
    return null;
}

function setCached(key, data, ttl = 3600000) {
    cache.set(key, { data, timestamp: Date.now(), ttl });
}

// Clean cache periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > (value.ttl || 3600000)) {
            cache.delete(key);
        }
    }
}, 300000); // 5 minutes

async function checkBinaryAvailability(binaryName) {
    return new Promise((resolve) => {
        const command = IS_WINDOWS ? 'where' : 'which';
        const proc = spawn(command, [binaryName], { stdio: 'ignore' });
        proc.on('close', (code) => resolve(code === 0));
        proc.on('error', () => resolve(false));
    });
}

function getPlatformInstallInstructions(binaryName) {
    const instructions = {
        yt_dlp: {
            windows: 'Download from https://github.com/yt-dlp/yt-dlp/releases and add to PATH',
            linux: 'Run: sudo apt install yt-dlp (Ubuntu/Debian) or sudo dnf install yt-dlp (Fedora)',
            macos: 'Run: brew install yt-dlp'
        },
        ffmpeg: {
            windows: 'Download from https://ffmpeg.org/download.html and add to PATH',
            linux: 'Run: sudo apt install ffmpeg',
            macos: 'Run: brew install ffmpeg'
        }
    };

    const binaryInstructions = instructions[binaryName];
    if (!binaryInstructions) {
        return `Please install ${binaryName} manually for your platform`;
    }
    return binaryInstructions[PLATFORM] || `Please install ${binaryName} manually for your platform`;
}

async function getContactSafely(message) {
    try {
        const basicContact = {
            pushname: 'Unknown',
            number: message.from ? message.from.split('@')[0] : 'Unknown',
            id: { _serialized: message.from || 'unknown@c.us' },
            verifiedName: '',
            isMyContact: false,
            isWAContact: true
        };
        // Can add more robust fetching here if needed, but keeping it safe for now
        return basicContact;
    } catch (error) {
        console.warn('Could not get contact details:', error.message);
        return {
            pushname: 'Unknown',
            number: message.from ? message.from.split('@')[0] : 'Unknown',
            id: { _serialized: message.from || 'unknown@c.us' },
            verifiedName: '',
            isMyContact: false,
            isWAContact: true
        };
    }
}

async function getMediaMessage(message) {
    if (message.hasMedia || (message.type && ['image', 'video', 'audio', 'document', 'sticker'].includes(message.type))) {
        return message;
    }
    if (message.hasQuotedMsg) {
        try {
            const quotedMsg = await message.getQuotedMessage();
            if (quotedMsg && (quotedMsg.hasMedia || ['image', 'video', 'audio', 'document', 'sticker'].includes(quotedMsg.type))) {
                return quotedMsg;
            }
        } catch (error) {
            console.log('Error fetching quoted message:', error.message);
        }
    }
    return null;
}

async function getMediaTitle(url) {
    return new Promise((resolve) => {
        const { exec } = require('child_process');
        exec(`yt-dlp --get-title --no-warnings "${url}"`, { timeout: 10000 }, (error, stdout) => {
            if (error || !stdout) {
                resolve('Media Content');
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

module.exports = {
    checkRateLimit,
    getCached,
    setCached,
    checkBinaryAvailability,
    getPlatformInstallInstructions,
    getContactSafely,
    getMediaMessage,
    getMediaTitle
};
