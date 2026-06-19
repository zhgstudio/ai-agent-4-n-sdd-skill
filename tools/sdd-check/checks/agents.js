const fs = require('fs');
const path = require('path');

// Required sections for OpenSDD AGENTS.md (accumulated across phases)
const REQUIRED_SECTIONS = [
  // From PM Agent (Phase 1)
  { keywords: ['质量验收', 'quality acceptance', '质量要求', 'quality standard', '验收标准'] },
  // From Architect Agent (Phase 2)
  { keywords: ['文件操作范围', 'file operation scope', 'file access scope'] },
  { keywords: ['提交规范', 'commit specification', 'commit convention', 'commit message'] },
  { keywords: ['测试要求', 'test requirement', 'test coverage', '测试覆盖'] },
  { keywords: ['升级条件', 'escalation condition', 'human介入', 'human intervention', 'pause and ask', '请求人类'] },
  { keywords: ['跨模块规则', 'cross-module rule', 'cross module rule', '模块间'] },
  // From Project Manager Agent (Phase 4)
  { keywords: ['plan.md', '任务规范', 'task convention', '任务标记'] },
];

module.exports = async function check(root) {
  const agentsPath = path.join(root, 'AGENTS.md');

  if (!fs.existsSync(agentsPath)) {
    return { name: 'AGENTS_SECTIONS', status: 'skip', messages: ['AGENTS.md not found, skipping'] };
  }

  const content = fs.readFileSync(agentsPath, 'utf-8');
  const lower = content.toLowerCase();

  const missing = [];

  for (const section of REQUIRED_SECTIONS) {
    const found = section.keywords.some(kw => lower.includes(kw.toLowerCase()));
    if (!found) {
      missing.push(section.keywords[0]);
    }
  }

  if (missing.length === 0) {
    return { name: 'AGENTS_SECTIONS', status: 'pass', messages: [`All ${REQUIRED_SECTIONS.length} required sections present`] };
  }

  return {
    name: 'AGENTS_SECTIONS',
    status: 'fail',
    messages: [`Missing sections: ${missing.join(', ')}`],
  };
};
