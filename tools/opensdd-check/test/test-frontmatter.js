'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const check = require('../checks/frontmatter');

describe('FRONTMATTER check', () => {
  /** @type {string} */
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-test-fm-'));
    const skillsDir = path.join(tmpDir, 'opensdd');
    fs.mkdirSync(skillsDir, { recursive: true });

    // Valid frontmatter
    fs.writeFileSync(
      path.join(skillsDir, 'SKILL.md'),
      `---
name: opensdd
description: "Test skill"
metadata:
  author: test
  version: 1.0.0
---

# Test
`,
    );

    // No frontmatter
    fs.writeFileSync(path.join(skillsDir, 'phase-1.md'), '# No frontmatter\n');

    // Partial frontmatter (name only, missing description/author/version)
    fs.writeFileSync(
      path.join(skillsDir, 'phase-2.md'),
      `---
name: phase2
---

# Partial
`,
    );
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should warn when files have missing or partial frontmatter', async () => {
    const result = await check(tmpDir, {});
    assert.strictEqual(result.name, 'FRONTMATTER');
    assert.strictEqual(result.status, 'warn');
    assert.ok(result.messages.length >= 2, `Expected 2+ issues, got ${result.messages.length}`);
  });
});
