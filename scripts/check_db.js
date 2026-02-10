const mongoose = require('mongoose');
require('dotenv').config();

async function checkSessions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('\n--- Collections found ---');
        collections.forEach(c => console.log(`- ${c.name}`));

        // Check for whatsapp-RemoteAuth collections
        const remoteAuthFiles = collections.filter(c => c.name.includes('RemoteAuth') && c.name.includes('files'));

        for (const col of remoteAuthFiles) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`\nCollection: ${col.name}`);
            console.log(`- Document count: ${count}`);

            if (count > 0) {
                const docs = await db.collection(col.name).find().toArray();
                docs.forEach(d => console.log(`  - File: ${d.filename}`));
            }
        }

    } catch (err) {
        console.error('Diagnostic error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkSessions();
