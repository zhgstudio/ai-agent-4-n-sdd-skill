'use strict';

/**
 * Escape special regex characters in a string for use in a RegExp constructor.
 *
 * @param {string} str - Raw string to escape
 * @returns {string} Escaped string safe for RegExp
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };
