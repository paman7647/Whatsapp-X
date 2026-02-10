const mongoose = require('mongoose');
require('dotenv').config();

async function clearSession() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) throw new Error('MONGODB_URI not defined');

        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // The default collection for wwebjs-mongo is 'whatsapp-RemoteAuth' or similar, 
        // but it stores files. Let's list collections and drop the one related to sessions.
        // Actually wwebjs-mongo uses a dynamic collection based on store config, default is 'whatsapp-sessions' or similar.
        // Let's try to drop the default one if it exists, or listing them.

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        for (const collection of collections) {
            if (collection.name.includes('whatsapp') || collection.name.includes('session') || collection.name.includes('RemoteAuth')) {
                console.log(`Dropping collection: ${collection.name}`);
                await mongoose.connection.db.dropCollection(collection.name);
                console.log('Dropped.');
            }
        }

        console.log('Session cleared. You can now restart the bot to scan a new QR code.');

    } catch (error) {
        console.error('Error clearing session:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

clearSession();
