'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

describe('TBD_RESIDUAL check', () => {
  const check = require('../checks/tbd-residual');

  /** @type {string} */
  let tmpDir;

  /** @type {import('../config').SddConfig} */
  const config = {};

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-tbd-'));
    fs.mkdirSync(path.join(tmpDir, 'docs'), { recursive: true });
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should pass when ARCHITECTURE.md has no [TBD] markers', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'docs', 'ARCHITECTURE.md'),
      [
        '# Architecture',
        '## 模块依赖矩阵',
        '| 模块 | 依赖 | 所需接口 |',
        '|------|------|----------|',
        '| 02-task-core | 01-auth | POST /auth/verify |',
      ].join('\n'),
      'utf-8',
    );

    const result = check(tmpDir, config);
    assert.strictEqual(result.status, 'pass');
    assert.ok(result.messages[0].includes('No residual'));
  });

  it('should fail when ARCHITECTURE.md contains [TBD] markers', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'docs', 'ARCHITECTURE.md'),
      [
        '# Architecture',
        '## 模块依赖矩阵',
        '| 模块 | 依赖 | 所需接口 |',
        '|------|------|----------|',
        '| 02-task-core | 01-auth | POST /auth/verify, [TBD: 角色鉴权接口] |',
      ].join('\n'),
      'utf-8',
    );

    const result = check(tmpDir, config);
    assert.strictEqual(result.status, 'fail');
    assert.ok(result.messages[0].includes('[TBD]'));
    assert.ok(result.messages.some((m) => m.includes('line')));
  });

  it('should skip when ARCHITECTURE.md does not exist', () => {
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-tbd-skip-'));
    try {
      const result = check(emptyDir, config);
      assert.strictEqual(result.status, 'skip');
    } finally {
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  });

  it('should fail on multiple [TBD] markers in different sections', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'docs', 'ARCHITECTURE.md'),
      [
        '# Architecture',
        '## 模块依赖矩阵',
        '| 模块 | 依赖 | 所需接口 |',
        '|------|------|----------|',
        '| 02-task-core | 01-auth | [TBD: 鉴权接口] |',
        '| 03-api-gateway | 02-task-core | [TBD: 路由接口] |',
      ].join('\n'),
      'utf-8',
    );

    const result = check(tmpDir, config);
    assert.strictEqual(result.status, 'fail');
    assert.ok(result.messages[0].startsWith('Found 2'));
  });

  it('should fail on inline [TBD] in running text', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'docs', 'ARCHITECTURE.md'),
      '# Architecture\n\nSome text with a [TBD] marker in a paragraph.',
      'utf-8',
    );

    const result = check(tmpDir, config);
    assert.strictEqual(result.status, 'fail');
  });
});
