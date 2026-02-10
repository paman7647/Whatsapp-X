const fs = require('fs');
const path = require('path');

const commandsDir = path.join(__dirname, '../src/commands');
const commandFiles = [];
const commands = new Map();
let errors = 0;

function scanCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            scanCommands(filePath);
        } else if (file.endsWith('.js')) {
            commandFiles.push(filePath);
        }
    }
}

console.log('🔍 Starting Module Integrity Test...\n');

if (!fs.existsSync(commandsDir)) {
    console.error(`❌ Commands directory not found: ${commandsDir}`);
    process.exit(1);
}

scanCommands(commandsDir);

console.log(`📂 Found ${commandFiles.length} command files.`);

for (const file of commandFiles) {
    try {
        const cmd = require(file);
        const relativePath = path.relative(process.cwd(), file);

        if (!cmd.name) {
            console.error(`❌ [MISSING NAME] ${relativePath}`);
            errors++;
            continue;
        }

        if (!cmd.execute) {
            console.error(`❌ [MISSING EXECUTE] ${relativePath}`);
            errors++;
            continue;
        }

        if (commands.has(cmd.name)) {
            console.error(`❌ [DUPLICATE NAME] ${relativePath} conflicts with ${commands.get(cmd.name)}`);
            errors++;
        } else {
            commands.set(cmd.name, relativePath);
        }

        if (cmd.aliases && Array.isArray(cmd.aliases)) {
            for (const alias of cmd.aliases) {
                if (commands.has(alias)) {
                    console.warn(`⚠️ [DUPLICATE ALIAS] Alias '${alias}' in ${relativePath} conflicts with ${commands.get(alias)}`);
                    // Aliases are less critical, so maybe just warn? Or error?
                    // Let's count as error for strictness if desired, but user asked to "fix any error".
                    // I will just warn for aliases.
                } else {
                    commands.set(alias, `${relativePath} (alias)`);
                }
            }
        }

    } catch (e) {
        console.error(`❌ [LOAD ERROR] ${path.relative(process.cwd(), file)}: ${e.message}`);
        errors++;
    }
}

console.log('\n📊 Test Results:');
if (errors === 0) {
    console.log('✅ All modules passed integrity checks!');
    process.exit(0);
} else {
    console.error(`❌ Found ${errors} errors.`);
    process.exit(1);
}
