const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');
const analytics = require('../services/analytics');

const commands = new Map();
const aliases = new Map();

function loadCommands() {
    const commandsDir = path.join(__dirname, '../commands');

    // Clear existing commands if re-loading
    commands.clear();
    aliases.clear();

    // Recursive function to find command files
    function scanDirectory(dir) {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                scanDirectory(filePath);
            } else if (file.endsWith('.js')) {
                try {
                    // Clear cache to allow reloading
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);

                    if (command.name) {
                        // Auto-assign category based on folder name
                        if (!command.category) {
                            const folderName = path.basename(dir);
                            command.category = folderName.charAt(0).toUpperCase() + folderName.slice(1);
                        }

                        commands.set(command.name.toLowerCase(), command);
                        logger.info(`Loaded command: ${command.name} (${command.category})`);

                        if (command.aliases && Array.isArray(command.aliases)) {
                            command.aliases.forEach(alias => aliases.set(alias.toLowerCase(), command.name.toLowerCase()));
                        }
                    }
                } catch (error) {
                    logger.error(`Failed to load command ${file}:`, error);
                }
            }
        }
    }

    scanDirectory(commandsDir);
    logger.success(`Loaded ${commands.size} commands with ${aliases.size} aliases`);
}

async function handleCommand(message, client) {
    const prefix = config.prefix || '.';
    const body = message.body;

    if (!body || !body.trim().startsWith(prefix)) return;

    // Remove prefix and split arguments
    const args = body.trim().slice(prefix.length).trim().split(/ +/);
    if (args.length === 0 && body.trim() === prefix) return; // Ignore just prefix

    const commandName = args.shift().toLowerCase();

    const actualCommandName = commands.has(commandName) ? commandName : aliases.get(commandName);
    const command = commands.get(actualCommandName);

    if (!command) return;

    // Check permissions (Owner only, Group only, etc.)
    if (command.ownerOnly) {
        const sender = message.author || message.from;
        const normalize = (id) => id.replace('@c.us', '').replace('@s.whatsapp.net', '').split(':')[0];
        const ownerId = (config.ownerId || '').split(':')[0];
        const isOwner = message.fromMe || normalize(sender) === normalize(ownerId);

        let isSudo = false;
        if (!isOwner) {
            try {
                const { SudoUser } = require('../models');
                const sudo = await SudoUser.findOne({ whatsappId: sender, isActive: true });
                if (sudo) isSudo = true;
            } catch (e) {
                // Ignore if model not ready
            }
        }

        if (!isOwner && !isSudo) {
            return;
        }
    }

    if (command.groupOnly) {
        const chat = await message.getChat();
        if (!chat.isGroup) {
            return message.reply('❌ This command can only be used in groups.');
        }
    }

    try {
        // Robust way to ensure messages always go to the correct chat
        message.remote = message.fromMe
            ? (message.to !== client.info.wid._serialized ? message.to : message.from)
            : message.from;

        const actualCommandName = commands.has(commandName) ? commandName : aliases.get(commandName);
        const command = commands.get(actualCommandName);

        if (command) {
            // Track analytics
            analytics.trackCommand(command.name);
        }

        logger.info(`Executing: ${commandName} in ${message.remote}`);
        await command.execute(message, args, client);
    } catch (error) {
        logger.error(`Error executing ${commandName}:`, error);
        await message.reply('An error occurred while executing this command.');
    }
}

module.exports = {
    loadCommands,
    handleCommand,
    commands
};
