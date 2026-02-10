const mongoose = require('mongoose');
const { COMMAND_PREFIX } = require('../config/config').prefix; // Adjust if needed, or just use literal

// MongoDB Models
const UserSchema = new mongoose.Schema({
    whatsappId: { type: String, required: true, unique: true },
    name: String,
    pmProtection: { type: Boolean, default: false },
    pmApprovalRequired: { type: Boolean, default: false },
    monitoringEnabled: { type: Boolean, default: false },
    afk: {
        isAfk: { type: Boolean, default: false },
        reason: { type: String, default: '' },
        since: { type: Date }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
    messageId: { type: String, required: true, unique: true },
    chatId: { type: String, required: true },
    senderId: String,
    senderName: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    messageType: { type: String, enum: ['text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contact', 'unknown'], default: 'text' },
    isDeleted: { type: Boolean, default: false },
    monitored: { type: Boolean, default: false },
    mediaUrl: String,
    mediaType: String,
    mediaSize: Number,
    mediaFilename: String,
    replyToMessageId: String,
    forwarded: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    editedAt: Date,
    mentions: [String], // Array of mentioned user IDs
    hashtags: [String], // Array of hashtags found in message
    keywords: [String], // Array of searchable keywords
    sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
    language: String,
    wordCount: Number,
    charCount: Number,
    isGroupMessage: { type: Boolean, default: false },
    groupId: String,
    groupName: String,
    isBroadcast: { type: Boolean, default: false },
    isStatus: { type: Boolean, default: false },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    contact: {
        name: String,
        phone: String,
        email: String
    },
    document: {
        filename: String,
        mimetype: String,
        size: Number,
        pageCount: Number
    },
    audio: {
        duration: Number,
        mimetype: String
    },
    video: {
        duration: Number,
        width: Number,
        height: Number,
        mimetype: String
    },
    image: {
        width: Number,
        height: Number,
        mimetype: String,
        caption: String
    },
    sticker: {
        pack: String,
        author: String
    },
    metadata: mongoose.Schema.Types.Mixed, // Additional metadata
    tags: [String], // Custom tags for organization
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    category: { type: String, enum: ['personal', 'business', 'spam', 'important', 'system'], default: 'personal' },
    readBy: [String], // Array of user IDs who read the message
    starred: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better performance
MessageSchema.index({ senderId: 1, timestamp: -1 });
MessageSchema.index({ chatId: 1, timestamp: -1 });
MessageSchema.index({ messageType: 1 });
MessageSchema.index({ monitored: 1 });
MessageSchema.index({ hashtags: 1 });
MessageSchema.index({ keywords: 1 });
MessageSchema.index({ category: 1 });
MessageSchema.index({ priority: 1 });
MessageSchema.index({ timestamp: -1 });
MessageSchema.index({ content: 'text' }); // Full-text search index

const NoteSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const TodoSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const PMRequestSchema = new mongoose.Schema({
    requesterId: { type: String, required: true },
    requesterName: String,
    message: String,
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    respondedAt: Date
});

const CommandPrefixSchema = new mongoose.Schema({
    chatId: { type: String, required: true, unique: true },
    prefix: { type: String, default: '/' }, // Default fallback
    setBy: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});



const TaskSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: Date,
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const FinanceSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: String,
    date: { type: Date, default: Date.now },
    tags: [String],
    createdAt: { type: Date, default: Date.now }
});

const StickerSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    stickerId: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed }, // Store base64 or file path
    name: String,
    pack: String,
    usageCount: { type: Number, default: 0 },
    isFavorite: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const StickerPackSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    packId: { type: String, required: true },
    name: { type: String, required: true },
    stickers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sticker' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const SudoUserSchema = new mongoose.Schema({
    whatsappId: { type: String, required: true, unique: true },
    name: String,
    addedBy: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    permissions: {
        canManageUsers: { type: Boolean, default: false },
        canManageStickers: { type: Boolean, default: true },
        canUseAI: { type: Boolean, default: true },
        canUseMedia: { type: Boolean, default: true }
    }
});

const SessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, default: 'default' },
    chunkIndex: { type: Number, default: 0 },
    totalChunks: { type: Number, default: 1 },
    sessionData: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const GroupConfigSchema = new mongoose.Schema({
    groupId: { type: String, required: true, unique: true },
    welcomeMessage: { type: String, default: '' },
    goodbyeMessage: { type: String, default: '' }, // New
    isMuted: { type: Boolean, default: false },
    antilink: { type: Boolean, default: false }, // New
    antispam: { type: Boolean, default: false }, // New
    updatedAt: { type: Date, default: Date.now }
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Message: mongoose.model('Message', MessageSchema),
    Note: mongoose.model('Note', NoteSchema),
    Todo: mongoose.model('Todo', TodoSchema),
    PMRequest: mongoose.model('PMRequest', PMRequestSchema),
    CommandPrefix: mongoose.model('CommandPrefix', CommandPrefixSchema),
    Config: require('./Config'),
    Task: mongoose.model('Task', TaskSchema),
    Finance: mongoose.model('Finance', FinanceSchema),
    Sticker: mongoose.model('Sticker', StickerSchema),
    StickerPack: mongoose.model('StickerPack', StickerPackSchema),
    SudoUser: mongoose.model('SudoUser', SudoUserSchema),
    Session: mongoose.model('Session', SessionSchema),
    GroupConfig: mongoose.model('GroupConfig', GroupConfigSchema)
};
