const { spawn } = require('child_process');
const config = require('../../config/config');

module.exports = {
    name: 'py',
    aliases: ['python', 'python3'],
    description: 'Execute Python 3 code (Owner Only)',
    category: 'System',
    ownerOnly: true,
    async execute(message, args, client) {
        if (args.length === 0) return message.reply('Please provide Python code to execute.');

        const code = args.join(' ');
        const statusMsg = await message.reply(' *Executing Python...*');

        const pythonProcess = spawn('python3', ['-c', code]);

        let stdout = '';
        let stderr = '';

        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            let response = '';
            if (stdout) {
                response += ` *Output:*\n\`\`\`python\n${stdout}\n\`\`\`\n`;
            }
            if (stderr) {
                response += ` *Stderr:*\n\`\`\`python\n${stderr}\n\`\`\`\n`;
            }
            if (code !== 0 && !stderr) {
                response += ` *Process exited with code:* ${code}`;
            }
            if (!stdout && !stderr && code === 0) {
                response += ' Execution completed (no output).';
            }

            await statusMsg.edit(response || ' Done (no output).');
        });

        // Timeout to prevent infinite loops
        setTimeout(() => {
            pythonProcess.kill();
        }, 10000); // 10s timeout
    }
};
