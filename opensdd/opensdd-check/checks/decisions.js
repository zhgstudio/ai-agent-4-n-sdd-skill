'use strict';

const { readFile } = require('../lib/read-file');
const { parseFrontmatter } = require('../lib/frontmatter');

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
  const { data, error } = parseFrontmatter(content);
  if (error) {
    issues.push(error);
  } else if (!data || Object.keys(data).length === 0) {
    issues.push('YAML frontmatter is empty');
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
