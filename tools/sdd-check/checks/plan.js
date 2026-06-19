const fs = require('fs');
const path = require('path');

// Expected: "- [ ] T-001: description [NN-name/DESIGN.md#F-NNN] (depends: T-001)"
// Breaks down to:
//   status: " " (todo), "x" (done)
//   taskId: T-001
//   description: anything
//   ref (optional): [NN-name/DESIGN.md#F-NNN]
//   depends (optional): depends: T-001
const TASK_RE = /^-\s+\[([ x])\]\s+(T-\d+)\s*:\s*(.+)$/;
// Optional reference at end: [NN-name/DESIGN.md#F-NNN]
const REF_RE = /\[([a-zA-Z0-9]+-[a-zA-Z0-9_-]+\/DESIGN\.md#F-\d+)\]/;
// Module directory prefix pattern: NN-name
const MODULE_DIR_RE = /^\d{2}-[a-zA-Z0-9_-]+$/;

// Extract module name from the ref path (e.g., "01-auth" from "01-auth/DESIGN.md#F-001")
function extractModuleFromRef(ref) {
  const parts = ref.split('/');
  if (parts.length >= 1) return parts[0];
  return null;
}

module.exports = async function check(root) {
  const planPath = path.join(root, 'docs/PLAN.md');

  if (!fs.existsSync(planPath)) {
    return { name: 'PLAN_FORMAT', status: 'skip', messages: ['docs/PLAN.md not found, skipping'] };
  }

  const lines = fs.readFileSync(planPath, 'utf-8').split('\n');
  const issues = [];
  let taskCount = 0;
  let refCount = 0;
  let moduleDirsFound = new Set();

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed.startsWith('- [')) continue;

    const match = trimmed.match(TASK_RE);
    if (!match) {
      issues.push(`line ${i + 1}: malformed — does not match "- [ ] T-{NNN}: description" pattern`);
      continue;
    }

    taskCount++;
    const status = match[1];
    const taskId = match[2];
    const descriptionPart = match[3];

    if (status !== ' ' && status !== 'x') {
      issues.push(`line ${i + 1}: invalid status "[${status}]", expected " " or "x"`);
    }

    if (!/^T-\d+$/.test(taskId)) {
      issues.push(`line ${i + 1}: invalid task ID "${taskId}", expected T-{NNN}`);
    }

    // Check for DESIGN.md reference
    const refMatch = descriptionPart.match(REF_RE);
    if (refMatch) {
      refCount++;
      const ref = refMatch[1];
      const moduleName = extractModuleFromRef(ref);

      // Verify module directory exists
      if (moduleName && MODULE_DIR_RE.test(moduleName)) {
        moduleDirsFound.add(moduleName);
        const moduleDirPath = path.join(root, 'docs/modules', moduleName);
        const designPath = path.join(moduleDirPath, 'DESIGN.md');
        if (!fs.existsSync(designPath)) {
          issues.push(`line ${i + 1}: referenced module dir "${moduleName}" exists but DESIGN.md not found`);
        }
      }
    }
  }

  if (issues.length === 0) {
    const detail = `${taskCount} tasks, ${refCount} with DESIGN.md references`;
    return { name: 'PLAN_FORMAT', status: 'pass', messages: [detail] };
  }

  return { name: 'PLAN_FORMAT', status: 'fail', messages: issues };
};
