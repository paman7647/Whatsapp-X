const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDatabase() {
    try {
        let mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            logger.warn('MONGODB_URI not found. RemoteAuth will fail if selected.');
            return;
        }

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4 // Force IPv4 for better cloud compatibility
        });

        logger.success('Database connection established');

        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

    } catch (error) {
        logger.error('Database connection failed:', error);
        // Don't exit if local session is available, but RemoteAuth requires DB
        if (process.env.SESSION_STORAGE_TYPE === 'mongo') {
            process.exit(1);
        }
    }
}

module.exports = connectDatabase;
