'use strict';

const yaml = require('js-yaml');

function parseFrontmatter(content) {
  const openMatch = content.match(/^---\r?\n/);
  if (!openMatch) return { data: null, error: 'missing YAML frontmatter (must start with ---)' };

  const openLen = openMatch[0].length;
  const afterOpen = content.slice(openLen);
  const closeMatch = afterOpen.match(/\r?\n---\r?\n/);
  if (!closeMatch) return { data: null, error: 'YAML frontmatter has no closing ---' };

  const yamlStr = content.substring(openLen, openLen + closeMatch.index);

  try {
    const data = yaml.load(yamlStr);
    return { data: typeof data === 'object' && data !== null ? data : {}, error: null };
  } catch (err) {
    return { data: null, error: `YAML parse error: ${err.message}` };
  }
}

function getField(data, dottedPath) {
  const direct = data[dottedPath];
  if (direct !== undefined) return direct;

  const parts = dottedPath.split('.');
  let current = data;
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}

module.exports = { parseFrontmatter, getField };
