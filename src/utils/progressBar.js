/**
 * Generates a progress bar string
 * @param {number} percentage - Progress percentage (0 to 100)
 * @param {number} size - Number of blocks in the bar
 * @returns {string} - Formatted progress bar: [] 40%
 */
function getProgressBar(percentage, size = 10) {
    const filledSize = Math.max(0, Math.min(size, Math.floor((percentage / 100) * size)));
    const emptySize = size - filledSize;

    // Using simple characters that work well on WhatsApp
    const filled = ''.repeat(filledSize);
    const empty = ''.repeat(emptySize);

    return `[${filled}${empty}] ${percentage.toFixed(1)}%`;
}

module.exports = { getProgressBar };
