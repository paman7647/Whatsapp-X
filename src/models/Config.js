const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

// Pre-seed default configs if not exists (handled in setup/logic, but schema is here)
module.exports = mongoose.model('Config', configSchema);
