const { spawn } = require('child_process');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Unified Bridge to call Python modules.
 * Standardizes communication via JSON strings in stdin/stdout.
 */
class PythonBridge {
    constructor() {
        this.scriptsPath = path.join(__dirname, '../python');
    }

    /**
     * Call a Python function in a specific module.
     * @param {string} scriptName - Name of the .py file in src/python/
     * @param {string} action - Action or function name to call
     * @param {Object} data - Arguments passed as JSON
     * @returns {Promise<any>} - Parsed JSON result from Python
     */
    async call(scriptName, action, data = {}) {
        const scriptPath = path.join(this.scriptsPath, scriptName);

        return new Promise((resolve, reject) => {
            const inputData = JSON.stringify({ action, ...data });

            const pyProcess = spawn('python3', [scriptPath]);

            let output = '';
            let errorBuffer = '';

            // Send data to Python via stdin
            pyProcess.stdin.write(inputData + '\n');
            pyProcess.stdin.end();

            pyProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pyProcess.stderr.on('data', (data) => {
                errorBuffer += data.toString();
            });

            pyProcess.on('close', (code) => {
                if (code !== 0) {
                    logger.error(`Python Error [${scriptName}]: ${errorBuffer}`);
                    return reject(new Error(errorBuffer || `Python process exited with code ${code}`));
                }

                try {
                    // Python scripts should output exactly ONE line of JSON at the end
                    const trimmedOutput = output.trim();
                    const lastLine = trimmedOutput.split('\n').pop();

                    if (!lastLine.startsWith('{') && !lastLine.startsWith('[')) {
                        // If the output isn't JSON, it might be a direct string or log
                        return resolve(trimmedOutput);
                    }

                    const result = JSON.parse(lastLine);
                    resolve(result);
                } catch (e) {
                    logger.error(`JSON Parse Error from Python [${scriptName}]: ${output}`);
                    resolve(output.trim()); // Fallback to raw output
                }
            });
        });
    }
}

module.exports = new PythonBridge();
