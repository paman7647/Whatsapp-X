const fs = require('fs');
const path = require('path');

const STATS_FILE = path.join(__dirname, '../../data/command_stats.json');
let stats = {};

// Ensure directory exists
try {
    const dataDir = path.dirname(STATS_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
} catch (e) { }

// Load stats
try {
    if (fs.existsSync(STATS_FILE)) {
        stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    }
} catch (e) {
    console.error('Failed to load stats:', e);
}

const saveStats = () => {
    try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error('Failed to save stats:', e);
    }
};

module.exports = {
    trackCommand: (commandName) => {
        if (!stats[commandName]) stats[commandName] = 0;
        stats[commandName]++;
        saveStats();

        // Emit update if socket is available
        if (global.io) {
            global.io.emit('analytics', stats);
        }
    },
    getStats: () => stats
};
