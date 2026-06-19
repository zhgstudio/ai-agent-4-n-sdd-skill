const fs = require('fs');
const path = require('path');

// Match NN-name module directory pattern
const MODULE_DIR_RE = /^\d{2}-[a-zA-Z0-9_-]+$/;

// Parse markdown table after "模块引用表" or "模块依赖矩阵" heading
function parseModuleTable(content) {
  const lines = content.split('\n');
  const modules = [];
  let inTable = false;

  for (const raw of lines) {
    const trimmed = raw.trim();

    // detect heading (Chinese or English keywords for reference table or dependency matrix)
    if (/^#{1,6}\s*(模块引用表|模块依赖矩阵|module reference table|module dep|dependency matrix)/i.test(trimmed)) {
      inTable = true;
      continue;
    }

    if (!inTable) continue;

    // skip separator rows (|----|----|---|)
    if (/^\|[\s\-:]+\|/.test(trimmed)) continue;

    // detect table row: | cell | cell | cell |
    const rowMatch = trimmed.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/);
    if (rowMatch) {
      // skip header row
      const firstCell = rowMatch[1].toLowerCase().trim();
      if (firstCell === '编号' || firstCell === '模块' || firstCell === 'module') continue;

      modules.push({
        name: rowMatch[1].trim(),
        description: rowMatch[2].trim(),
        ref: rowMatch[3].trim(),
      });
      continue;
    }

    // if we hit another heading after finding rows, stop scanning
    if (/^#{1,6}\s/.test(trimmed)) {
      if (modules.length > 0) break;
    }
  }

  return modules;
}

// Also parse dependency matrix columns: | 模块 | 依赖 | 所需接口 |
function parseDependencyMatrix(content) {
  const lines = content.split('\n');
  const modules = [];
  let inMatrix = false;

  for (const raw of lines) {
    const trimmed = raw.trim();

    // detect heading (Chinese or English)
    if (/^#{1,6}\s*(模块依赖矩阵|模块依赖|module dep|dependency matrix)/i.test(trimmed)) {
      inMatrix = true;
      continue;
    }

    if (!inMatrix) continue;

    // skip separator rows (|----|----|---|)
    if (/^\|[\s\-:]+\|/.test(trimmed)) continue;

    // detect table row: | cell | cell | cell |
    const rowMatch = trimmed.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/);
    if (rowMatch) {
      // skip header row (检查任意列的关键字)
      const firstCell = rowMatch[1].toLowerCase().trim();
      if (firstCell === '模块' || firstCell === 'module') continue;

      modules.push({
        name: rowMatch[1].trim(),
        depends: rowMatch[2].trim(),
        interface: rowMatch[3].trim(),
      });
      continue;
    }

    // if we hit another heading after finding rows, stop scanning
    if (/^#{1,6}\s/.test(trimmed)) {
      if (modules.length > 0) break;
    }
  }

  return modules;
}

module.exports = async function check(root) {
  const archPath = path.join(root, 'docs/ARCHITECTURE.md');

  if (!fs.existsSync(archPath)) {
    return { name: 'DEP_MATRIX', status: 'skip', messages: ['docs/ARCHITECTURE.md not found, skipping'] };
  }

  const content = fs.readFileSync(archPath, 'utf-8');
  const moduleTable = parseModuleTable(content);
  const depMatrix = parseDependencyMatrix(content);

  // Collect module names from both tables
  const moduleNames = new Set();
  for (const m of moduleTable) {
    if (m.name) moduleNames.add(m.name);
  }
  for (const m of depMatrix) {
    if (m.name) moduleNames.add(m.name);
  }

  if (moduleNames.size === 0) {
    return { name: 'DEP_MATRIX', status: 'warn', messages: ['No module reference table or dependency matrix found in ARCHITECTURE.md'] };
  }

  const missing = [];

  for (const name of moduleNames) {
    // Check module name follows NN-name format
    if (!MODULE_DIR_RE.test(name)) {
      missing.push(`Module '${name}' does not follow NN-name format (e.g. 01-auth)`);
      continue;
    }

    const dirPath = path.join(root, 'docs/modules', name);
    const designPath = path.join(dirPath, 'DESIGN.md');

    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      missing.push(`Module '${name}' declared but missing from docs/modules/`);
    } else if (!fs.existsSync(designPath)) {
      missing.push(`Module '${name}' directory exists but DESIGN.md not found`);
    }
  }

  if (missing.length === 0) {
    return {
      name: 'DEP_MATRIX',
      status: 'pass',
      messages: [`${moduleNames.size} modules in matrix, all have docs/modules/{NN}-{name}/DESIGN.md`],
    };
  }

  return {
    name: 'DEP_MATRIX',
    status: 'warn',
    messages: missing,
  };
};
