# OpenSDD Methodology & Tooling Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix identified issues in OpenSDD skill methodology (5 changes) and opensdd-check tooling (8 changes including critical bug fixes).

**Architecture:** Two independent work streams: (A) Skill methodology — markdown files in `opensdd/` directory; (B) Tooling — JavaScript files in `tools/opensdd-check/`. These can be executed in parallel.

**Tech Stack:** Markdown (skill), Node.js 18+ (tooling)

---

## A. Skill Methodology Changes

### Task A1: Move quality acceptance from AGENTS.md to SPEC.md

**Files:**
- Modify: `opensdd/phase-1.md` — remove AGENTS.md quality criteria step, add to SPEC.md requirements
- Modify: `opensdd/phase-2.md` — remove "read AGENTS.md for quality acceptance" from context
- Modify: `opensdd/SKILL.md` — update AGENTS.md accumulation description, PM Agent output docs

- [ ] **Step A1-1: Edit phase-1.md**

Change the behavior item 5: instead of appending quality criteria to AGENTS.md, fold quality criteria into SPEC.md as part of non-functional requirements section.

Old:
```
5. 本轮评审通过后，**在 `AGENTS.md` 中追加"质量验收标准"章节**...
```

New:
```
5. 本轮评审通过后，确认 `SPEC.md` 中已包含质量验收标准（属于非功能性需求章节的一部分），不再单独写入 `AGENTS.md`
```

Also update the output section to remove `AGENTS.md` reference.

- [ ] **Step A1-2: Edit phase-2.md**

Remove "AGENTS.md（只读，了解质量验收标准）" from the context section. The context should only load SPEC.md read-only.

- [ ] **Step A1-3: Edit SKILL.md**

Update:
- PM Agent row in the four-role model table: remove "追加 AGENTS.md 质量验收标准"
- PM Agent output description: only SPEC.md
- AGENTS.md accumulation description: remove PM Agent's quality criteria contribution
- Phase 1 startup prompt template

- [ ] **Step A1-4: Edit README.md and README.zh.md** — sync the same change

Remove all mentions of PM Agent appending quality acceptance to AGENTS.md. SPEC.md now covers quality criteria as non-functional requirements.

- [ ] **Step A1-5: Edit checks/agents.js** — remove quality acceptance from required sections (it's no longer in AGENTS.md)

Remove `{ keywords: ['质量验收', 'quality acceptance', '质量要求', 'quality standard', '验收标准'] }` from `requiredAgentSections` in `config.js`.

---

### Task A2: Enhance F-{NNN} to {NN}-F{NNN} for cross-module readability

**Files:**
- Modify: `opensdd/phase-3.md` — change F-{NNN} to {NN}-F{NNN} in examples and description
- Modify: `opensdd/phase-4.md` — change reference format from `[NN-name/DESIGN.md#F-NNN]` to `[NN-name/DESIGN.md#NN-F-NNN]`
- Modify: `opensdd/SKILL.md` — sync the numbering convention
- Modify: `tools/opensdd-check/checks/plan.js` — update REF_RE and logic to expect `NN-F-NNN` format
- Modify: `tools/opensdd-check/config.js` — update any reference to task format if needed
- Modify: `tools/opensdd-check/test/test-plan.js` — update test data

- [ ] **Step A2-1: Edit phase-3.md**

Change the feature list numbering from `### F-{NNN}` to `### {NN}-F{NNN}` where `{NN}` is the module's two-digit prefix.

Old example:
```
### F-001: 用户注册接口
### F-002: 用户登录接口
```

New example:
```
### 01-F001: 用户注册接口
### 01-F002: 用户登录接口
```

Update the description text accordingly.

- [ ] **Step A2-2: Edit phase-4.md**

Change PLAN.md task reference format from `[01-auth/DESIGN.md#F-001]` to `[01-auth/DESIGN.md#01-F001]`.

- [ ] **Step A2-3: Edit SKILL.md**

Sync all F-{NNN} → {NN}-F{NNN} references in the overview and phase descriptions.

- [ ] **Step A2-4: Edit plan.js** — update REF_RE regex

Old: `/\[([a-zA-Z0-9]+-[a-zA-Z0-9_-]+\/DESIGN\.md#F-\d+)\]/`
New: `/\[([a-zA-Z0-9]+-[a-zA-Z0-9_-]+\/DESIGN\.md#\d{2}-F\d+)\]/`

- [ ] **Step A2-5: Edit test-plan.js** — update test data to use new format

- [ ] **Step A2-6: Edit agents.js** — update AGENTS.md section keyword matching for task conventions (should reference `NN-FNNN` format)

---

### Task A3: Add INTERFACE.md/INTERNALS.md separation to phase-3

**Files:**
- Modify: `opensdd/phase-3.md` — add guidance to split DESIGN.md into INTERFACE.md (public) + INTERNALS.md (private)
- Modify: `opensdd/SKILL.md` — update module directory structure

- [ ] **Step A3-1: Edit phase-3.md**

Add a subsection after the main DESIGN.md description:

```
### 接口与实现分离

为支持阶段三的"只读依赖接口"约束，模块设计文档应拆分为两个文件：
- `docs/modules/{NN}-{name}/INTERFACE.md` — 对外接口定义（数据结构、API 入参/出参、错误码），供被依赖模块的设计师只读
- `docs/modules/{NN}-{name}/INTERNALS.md` — 内部实现细节（核心逻辑流程、状态机、内部数据结构），仅本模块设计师可读写

注意：两个文件中的命名和异常处理必须 100% 继承 ARCHITECTURE.md 的规范；`INTERFACE.md` 中的接口定义是跨模块契约，变更须升级至人类仲裁。
```

Update the "只读约束" section (item 5) to reference INTERFACE.md instead of DESIGN.md.

- [ ] **Step A3-2: Edit SKILL.md**

Update the directory topology to show `INTERFACE.md` and `INTERNALS.md` instead of just `DESIGN.md`.

---

### Task A4: Add consistency check step for PM Agent in phase-4

**Files:**
- Modify: `opensdd/phase-4.md` — add consistency check step

- [ ] **Step A4-1: Edit phase-4.md**

Add a new behavior item between existing items:

```
5. **一致性检查**：在生成 PLAN.md 之前，执行以下完整性验证：
   - 跨模块接口匹配：检查所有模块的 INTERFACE.md 中，被依赖方提供的接口与依赖方调用的接口是否签名一致
   - 功能覆盖检查：确认每个模块的 INTERFACE.md 中的功能特性与 ARCHITECTURE.md 模块引用表中的描述无矛盾
   - 如果发现不一致，**暂停并升级给人类**，说明矛盾的具体位置和内容，等待人类决策后再继续
```

Renumber existing items.

---

### Task A5: Document platform session assumption as human decision

**Files:**
- Modify: `opensdd/SKILL.md` — clarify that session management is human-controlled

- [ ] **Step A5-1: Edit SKILL.md**

In the "四角色模型" section, add a note:

```
> **会话管理说明：** 每个角色启动新会话的操作由**人类**手动完成。如果使用的 AI 平台不支持洁净会话隔离，人类可以在同一会话中手动重置上下文。本技能定义的"新会话"是指认知上的上下文隔离——确保同一角色只加载职责范围内的文件。
```

---

## B. Tooling Fixes (opensdd-check)

### Task B1: Fix reporter.js _root deletion bug (Critical)

**Files:**
- Modify: `tools/opensdd-check/lib/reporter.js`
- Test: `tools/opensdd-check/test/test-reporter.js` (create)

- [ ] **Step B1-1: Fix the _root deletion bug in reporter.js**

The bug: `report()` deletes `_root` from results at line 122-124, then `terminalReport()` at line 44 and `jsonReport()` at line 93 try to read `results[0]._root` which is already undefined.

Fix: Change the `report()` function to pass `_root` to reports before deleting, or better, don't delete `_root` at all — just avoid serializing it.

Change:
```javascript
module.exports.report = function report(results, opts = {}) {
  // attach root for reporting
  for (const r of results) {
    delete r._root;  // BUG: deleted before read
  }
  if (opts.json) {
    return jsonReport(results, opts.strict);
  }
  return terminalReport(results, opts.strict);
};
```

To:
```javascript
module.exports.report = function report(results, opts = {}) {
  if (opts.json) {
    // strip internal _root before serializing
    const clean = results.map(r => {
      const { _root, ...rest } = r;
      return rest;
    });
    return jsonReport(clean, opts.strict);
  }
  return terminalReport(results, opts.strict);
};
```

Also need to make `_root` actually set by the index.js entry point. In `index.js`, attach `_root` to results:

```javascript
const results = await Promise.all([
  filesCheck(resolvedRoot, config),
  planCheck(resolvedRoot, config),
  matrixCheck(resolvedRoot, config),
  garbageCheck(resolvedRoot, config),
  agentsCheck(resolvedRoot, config),
]);
// Attach root for reporting
for (const r of results) {
  r._root = resolvedRoot;
}
```

- [ ] **Step B1-2: Create test-reporter.js**

Test the reporter module: terminal output format, JSON output, exit codes, strict mode, _root handling.

- [ ] **Step B1-3: Update index.js** to attach `_root` to results

---

### Task B2: Fix plan.js hardcoded regex + dead code

**Files:**
- Modify: `tools/opensdd-check/checks/plan.js`

- [ ] **Step B2-1: Replace hardcoded regex with config reference**

Line 30: `const MODULE_DIR_RE = /^\d{2}-[a-zA-Z0-9_-]+$/;`
Change to: `const MODULE_DIR_RE = new RegExp(config.moduleDirPattern);`

- [ ] **Step B2-2: Remove dead code**

Remove the `moduleDirsFound` variable (line 41) and its `add()` call (line 77).

- [ ] **Step B2-3: Update REF_RE to match new {NN}-F{NNN} format**

Line 7: Change F-\\d+ to \\d{2}-F\\d+
`const REF_RE = /\[([a-zA-Z0-9]+-[a-zA-Z0-9_-]+\/DESIGN\.md#\d{2}-F\d+)\]/;`

---

### Task B3: Fix matrix.js — warn-only issues and orphan detection

**Files:**
- Modify: `tools/opensdd-check/checks/matrix.js`
- Modify: `tools/opensdd-check/test/test-matrix.js`

- [ ] **Step B3-1: Upgrade critical DEP_MATRIX issues to fail**

Change status from 'warn' to 'fail' for:
- Missing module directories (line 203)
- DESIGN.md not found (line 205)
- Invalid dependency references (lines 217-219)
- Keep 'warn' for: "no module reference table found" (line 187) — because no table is informational

- [ ] **Step B3-2: Add orphan module detection**

After validating modules from the tables, scan `docs/modules/` directory for actual directories and cross-check against `moduleNames` set. Report orphans as warnings.

---

### Task B4: Fix garbage.js — non-md files + skip dirs configurability

**Files:**
- Modify: `tools/opensdd-check/checks/garbage.js`
- Modify: `tools/opensdd-check/config.js`

- [ ] **Step B4-1: Remove .md-only restriction in garbage regex**

Change the regex to match all files with garbage patterns, not just `.md` files. Update `config.js` default garbagePatterns if needed.

- [ ] **Step B4-2: Make skip directories configurable**

Add `skipDirs` field to `DEFAULT_CONFIG` in `config.js`:
```javascript
skipDirs: ['node_modules', '.git', '.github']
```

Read from config in garbage.js instead of hardcoded `SKIP_DIRS`.

---

### Task B5: Fix config.js — shallow merge to support array extend

**Files:**
- Modify: `tools/opensdd-check/config.js`

- [ ] **Step B5-1: Add deep merge support for arrays**

Instead of `{ ...DEFAULT_CONFIG, ...userConfig }`, implement per-key merge logic:
- For array fields (requiredFiles, requiredAgentSections, garbagePatterns): concatenate user values to defaults
- For string fields (taskRegex, moduleDirPattern): user value overrides default

Use a merge function:
```javascript
function mergeConfig(defaults, user) {
  const result = { ...defaults };
  for (const key of Object.keys(user)) {
    if (Array.isArray(defaults[key]) && Array.isArray(user[key])) {
      result[key] = [...defaults[key], ...user[key]];
    } else {
      result[key] = user[key];
    }
  }
  return result;
}
```

---

### Task B6: Add YAML frontmatter validation for skill files

**Files:**
- Create: `tools/opensdd-check/checks/frontmatter.js`
- Modify: `tools/opensdd-check/index.js` — add frontmatter check
- Modify: `tools/opensdd-check/config.js` — add default config for frontmatter
- Create: `tools/opensdd-check/test/test-frontmatter.js`

- [ ] **Step B6-1: Create checks/frontmatter.js**

Check that all `.md` files under `opensdd/` have valid YAML frontmatter matching the expected schema:
- `name` field (string)
- `description` field (string)
- `metadata.author` field (string)
- `metadata.version` field (semver-ish)

- [ ] **Step B6-2: Update index.js** to include the new check

- [ ] **Step B6-3: Update config.js** with frontmatter config

- [ ] **Step B6-4: Create test-frontmatter.js**

---

### Task B7: Add tests for index.js, config.js

**Files:**
- Create: `tools/opensdd-check/test/test-index.js`
- Create: `tools/opensdd-check/test/test-config.js`

- [ ] **Step B7-1: Create test-config.js**

Test:
- Default config returned when no `.sddrc.json` exists
- User config merges correctly with deep merge
- Invalid `.sddrc.json` falls back to defaults with warning
- `requiredAgentSections` array extends correctly

- [ ] **Step B7-2: Create test-index.js**

Test:
- `--path` argument parsing
- `--json` flag
- `--strict` flag
- `--help` / `-h` exits with 0
- Unknown arguments are ignored

---

## C. Verification

### Task C1: Run all tests

- [ ] **Step C1-1: Run opensdd-check test suite**

```bash
cd tools/opensdd-check && npm test
```

- [ ] **Step C1-2: Run CI checks**

```bash
cd tools/opensdd-check && npm run lint && npm run format-check
```
