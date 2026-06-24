'use strict';

function parseValue(str) {
  const trimmed = str.trim();

  if (trimmed === '' || trimmed === '~' || trimmed === 'null') return null;

  if (trimmed === 'true' || trimmed === 'yes' || trimmed === 'on') return true;
  if (trimmed === 'false' || trimmed === 'no' || trimmed === 'off') return false;

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1);
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1);

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

  return trimmed;
}

function parseSimpleYaml(str) {
  if (!str || !str.trim()) return {};

  const lines = str.split(/\r?\n/);
  const result = {};
  const stack = [{ indent: -1, obj: result }];

  for (const raw of lines) {
    if (/^\s*$/.test(raw) || /^\s*#/.test(raw)) continue;

    const indent = raw.search(/\S/);
    if (indent === -1) continue;

    const trimmed = raw.trim();
    const line = trimmed.replace(/[ \t]+#.*$/, '').trimEnd();
    if (!line) continue;

    const match = line.match(/^([^:#]+?)\s*:\s*(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    const value = match[2].trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    if (value === '') {
      const child = {};
      stack[stack.length - 1].obj[key] = child;
      stack.push({ indent, obj: child });
    } else {
      stack[stack.length - 1].obj[key] = parseValue(value);
    }
  }

  return result;
}

function parseFrontmatter(content) {
  const openMatch = content.match(/^---\r?\n/);
  if (!openMatch) return { data: null, error: 'missing YAML frontmatter (must start with ---)' };

  const openLen = openMatch[0].length;
  const afterOpen = content.slice(openLen);
  const closeMatch = afterOpen.match(/\r?\n---\r?\n/);
  if (!closeMatch) return { data: null, error: 'YAML frontmatter has no closing ---' };

  const yamlStr = content.substring(openLen, openLen + closeMatch.index);

  try {
    const data = parseSimpleYaml(yamlStr);
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
