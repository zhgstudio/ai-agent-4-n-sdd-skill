'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { detectLanguage } = require('../checks/language');

describe('language detection', () => {
  describe('detectLanguage', () => {
    it('should detect Chinese text', () => {
      assert.strictEqual(detectLanguage('\u8fd9\u662f\u4e00\u4e2a\u6d4b\u8bd5\u9879\u76ee\u3002'), 'zh');
    });

    it('should detect English text', () => {
      assert.strictEqual(detectLanguage('This is a test project.'), 'en');
    });

    it('should return unknown for empty text', () => {
      assert.strictEqual(detectLanguage(''), 'unknown');
    });

    it('should return unknown for text with no letters', () => {
      assert.strictEqual(detectLanguage('12345!@#$%'), 'unknown');
    });

    it('should classify mixed Chinese/English as zh when Chinese dominates', () => {
      const mixed = '\u7528\u6237\u767b\u5f55\u63a5\u53e3 POST /auth/login \u9a8c\u8bc1\u7528\u6237\u8d26\u53f7\u5bc6\u7801';
      assert.strictEqual(detectLanguage(mixed), 'zh');
    });

    it('should classify mixed English/Chinese as en when English dominates', () => {
      const mixed = 'The user login API \u63a5\u53e3 handles authentication via POST /auth/login endpoint validation.';
      assert.strictEqual(detectLanguage(mixed), 'en');
    });

    it('should ignore fenced code blocks when detecting language', () => {
      const content = [
        '\u8fd9\u662f\u4e2a\u4e2d\u6587\u6587\u6863\u3002',
        '',
        '\u4ee3\u7801\u793a\u4f8b\u003a',
        '\x60\x60\x60javascript',
        'const x = 1; // English comment',
        'function foo() { return "bar"; }',
        '\x60\x60\x60',
        '',
        '\u7ee7\u7eed\u4e2d\u6587\u5185\u5bb9\u3002',
      ].join('\n');
      assert.strictEqual(detectLanguage(content), 'zh');
    });

    it('should detect zh with English API names in Chinese text', () => {
      const content = [
        '# \u6a21\u5757\u6982\u8ff0\u4e0e\u804c\u8d23\u8fb9\u754c',
        '\u8d1f\u8d23\u7528\u6237\u8ba4\u8bc1\u3002',
        '',
        '## \u6838\u5fc3\u6570\u636e\u7ed3\u6784',
        '- userId: string',
        '- createdAt: Date',
        '',
        '## \u63a5\u53e3\u5b9a\u4e49',
        '- POST /auth/register',
        '- POST /auth/login',
      ].join('\n');
      assert.strictEqual(detectLanguage(content), 'zh');
    });

    it('should ignore inline code spans', () => {
      const content = '\u4f7f\u7528 `createUser()` \u51fd\u6570\u521b\u5efa\u7528\u6237\u3002' +
        '\u8c03\u7528 `validateToken(token)` \u9a8c\u8bc1\u4ee4\u724c\u3002';
      assert.strictEqual(detectLanguage(content), 'zh');
    });

    it('should ignore URLs', () => {
      const content = '\u8bf7\u53c2\u8003 https://example.com/api/docs \u4e86\u89e3\u66f4\u591a\u3002';
      assert.strictEqual(detectLanguage(content), 'zh');
    });
  });
});

describe('language consistency full check', () => {
  const check = require('../checks/language');
  const DEFAULT_CONFIG = require('../config').DEFAULT_CONFIG;

  /** @type {string} */
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-lang-'));
    const docsDir = path.join(tmpDir, 'docs');
    const modDir = path.join(docsDir, 'modules', '01-auth');
    fs.mkdirSync(modDir, { recursive: true });
  });

  after(() => {
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should pass when all documents use consistent language', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'docs/SPEC.md'),
      '# \u9700\u6c42\u89c4\u683c\n\n\u8fd9\u662f\u4e00\u4e2a\u6d4b\u8bd5\u9879\u76ee\u3002\n',
      'utf-8',
    );
    fs.writeFileSync(
      path.join(tmpDir, 'AGENTS.md'),
      '# AGENTS\n\n## \u6587\u4ef6\u64cd\u4f5c\u8303\u56f4\n\u4ec5允\u8bb8\u64cd\u4f5c src/ \u76ee\u5f55\u3002\n',
      'utf-8',
    );

    const result = await check(tmpDir, DEFAULT_CONFIG);
    assert.strictEqual(result.status, 'pass');
  });

  it('should fail on mixed languages', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'docs/SPEC.md'),
      '# Requirements Specification\n\nThis is a test project.\n',
      'utf-8',
    );

    const result = await check(tmpDir, DEFAULT_CONFIG);
    assert.strictEqual(result.status, 'fail');
    assert.ok(result.messages.some((m) => m.includes('Mixed')));
  });

  it('should skip when no documents found', async () => {
    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-lang-empty-'));
    const result = await check(emptyDir, DEFAULT_CONFIG);
    assert.strictEqual(result.status, 'skip');
    fs.rmSync(emptyDir, { recursive: true, force: true });
  });
});
