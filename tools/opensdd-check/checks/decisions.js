'use strict';

const { readFile } = require('../lib/read-file');

/**
 * Check that DECISIONS.md has valid YAML frontmatter.
 *
 * @param {string} root - Absolute path to the project root
 * @returns {{name: string, status: string, messages: string[]}} Check result
 */
module.exports = function checkDecisions(root) {
  const content = readFile(root, 'docs', 'DECISIONS.md');

  if (content === null) {
    return {
      name: 'DECISIONS_FORMAT',
      status: 'skip',
      messages: ['docs/DECISIONS.md not found, skipping'],
    };
  }

  const issues = [];

  // Check YAML frontmatter validity
  const openMatch = content.match(/^---\r?\n/);
  if (!openMatch) {
    issues.push('Missing YAML frontmatter (must start with ---)');
  } else {
    const openLen = openMatch[0].length;
    const afterOpen = content.slice(openLen);
    const closeMatch = afterOpen.match(/\r?\n---\r?\n/);
    if (!closeMatch) {
      issues.push('YAML frontmatter has no closing ---');
    }
  }

  if (issues.length === 0) {
    return {
      name: 'DECISIONS_FORMAT',
      status: 'pass',
      messages: ['docs/DECISIONS.md has valid frontmatter'],
    };
  }

  return {
    name: 'DECISIONS_FORMAT',
    status: 'warn',
    messages: issues,
  };
};
