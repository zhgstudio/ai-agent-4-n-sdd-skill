'use strict';

const fs = require('fs');
const path = require('path');
const { readFile } = require('../lib/read-file');
const { parseFrontmatter, getField } = require('../lib/frontmatter');

/**
 * Parse SKILL.md frontmatter and extract version.
 *
 * @param {string} root - Absolute path to the project root
 * @returns {string|null} Version string or null
 */
function readSkillVersion(root) {
  const content = readFile(root, 'opensdd', 'SKILL.md');
  if (content === null) return null;
  const { data } = parseFrontmatter(content);
  if (!data) return null;
  const version = getField(data, 'metadata.version');
  return typeof version === 'string' ? version : null;
}

/**
 * Read a JSON file and return the version field, or null if not found.
 *
 * @param {string} filePath - Absolute path to package.json
 * @returns {string|null} Version string or null
 */
function readPackageVersion(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    const pkg = JSON.parse(raw);
    return typeof pkg.version === 'string' ? pkg.version : null;
  } catch {
    return null;
  }
}

/**
 * Extract version value from raw YAML frontmatter content (without --- markers).
 *
 * @param {string} frontmatter - Raw YAML string (as it appears between --- markers)
 * @returns {string|null} Version string or null if not found
 */
function extractFrontmatterVersion(frontmatter) {
  const { data } = parseFrontmatter('---\n' + frontmatter + '\n---\n');
  if (!data) return null;
  const version = getField(data, 'metadata.version');
  return typeof version === 'string' ? version : null;
}

/**
 * Check that SKILL.md version matches all package.json version fields.
 *
 * @param {string} root - Absolute path to the project root
 * @returns {{name: string, status: string, messages: string[]}} Check result
 */
module.exports = function check(root) {
  const rootPkgPath = path.join(root, 'package.json');
  const checkPkgPath = path.join(root, 'opensdd', 'opensdd-check', 'package.json');

  const skillVersion = readSkillVersion(root);

  if (skillVersion === null) {
    return {
      name: 'VERSION_CONSISTENCY',
      status: 'skip',
      messages: ['opensdd/SKILL.md not found or missing version frontmatter, skipping'],
    };
  }

  const messages = [];
  let hasMismatch = false;
  let hasMissing = false;

  const entries = [
    { label: 'SKILL.md', version: skillVersion, source: 'metadata.version' },
    { label: 'Root package.json', path: rootPkgPath, version: null, source: 'version' },
    { label: 'opensdd/opensdd-check/package.json', path: checkPkgPath, version: null, source: 'version' },
  ];

  for (const entry of entries) {
    if (entry.label === 'SKILL.md') {
      // Already have the version; just log for reference
      messages.push(`${entry.label}: version = ${entry.version} (${entry.source})`);
      continue;
    }

    const ver = readPackageVersion(entry.path);
    if (ver === null) {
      messages.push(`${entry.label}: missing or unreadable — version not checked`);
      hasMissing = true;
      continue;
    }

    messages.push(`${entry.label}: version = ${ver} (${entry.source})`);

    if (ver !== skillVersion) {
      messages.push(`  → MISMATCH: SKILL.md version ${skillVersion}, ${entry.label} version ${ver}`);
      hasMismatch = true;
    }
  }

  if (hasMismatch) {
    return {
      name: 'VERSION_CONSISTENCY',
      status: 'fail',
      messages,
    };
  }

  if (hasMissing) {
    return {
      name: 'VERSION_CONSISTENCY',
      status: 'warn',
      messages: ['Versions consistent, but some package.json files missing', ...messages.slice(1)],
    };
  }

  return {
    name: 'VERSION_CONSISTENCY',
    status: 'pass',
    messages: [`All ${entries.length} sources agree on version ${skillVersion}`],
  };
};

module.exports.extractFrontmatterVersion = extractFrontmatterVersion;
