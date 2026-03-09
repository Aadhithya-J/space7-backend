/**
 * Count words in a string.
 * @param {string} text
 * @returns {number}
 */
function wordCounter(text) {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
}

module.exports = wordCounter;
