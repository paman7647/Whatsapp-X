const { GoogleGenAI } = require('@google/genai');
const config = require('../src/config/config');

async function listModels() {
    try {
        const client = new GoogleGenAI({ apiKey: config.geminiApiKey });
        // The new SDK might not have a simple listModels, so let's try a few common ones
        const models = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-2.0-flash-exp', 'gemini-2.0-flash'];

        console.log('Testing model availability...');
        for (const model of models) {
            try {
                const genModel = client.models.get(model);
                console.log(`[OK] Model ${model} is potentially available.`);
            } catch (e) {
                console.log(`[FAIL] Model ${model}: ${e.message}`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('List failed:', err);
        process.exit(1);
    }
}

listModels();
