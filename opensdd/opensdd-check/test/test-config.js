'use strict';

const { describe, it, before, after, mock } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const { loadConfig, DEFAULT_CONFIG } = require('../config');

describe('config', () => {
  /** @type {string} */
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-test-cfg-'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should return defaults when no .sddrc.json exists', () => {
    const config = loadConfig(tmpDir);
    assert.deepStrictEqual(config.requiredFiles, DEFAULT_CONFIG.requiredFiles);
  });

  it('should replace arrays with user values', () => {
    const configPath = path.join(tmpDir, '.sddrc.json');
    fs.writeFileSync(configPath, JSON.stringify({ requiredFiles: ['docs/EXTRA.md'] }));
    const config = loadConfig(tmpDir);
    assert.strictEqual(config.requiredFiles.length, 1, 'should only include user files');
    assert.ok(config.requiredFiles.includes('docs/EXTRA.md'), 'should include user files');
    assert.ok(!config.requiredFiles.includes('docs/SPEC.md'), 'should not include default files');
  });

  it('should fall back to defaults on invalid JSON', () => {
    const configPath = path.join(tmpDir, '.sddrc.json');
    fs.writeFileSync(configPath, 'not json');
    const config = loadConfig(tmpDir);
    assert.deepStrictEqual(config.requiredFiles, DEFAULT_CONFIG.requiredFiles);
  });

  it('should override string fields with user values', () => {
    const configPath = path.join(tmpDir, '.sddrc.json');
    fs.writeFileSync(configPath, JSON.stringify({ taskRegex: '^custom$' }));
    const config = loadConfig(tmpDir);
    assert.strictEqual(config.taskRegex, '^custom$');
  });

  it('should warn on invalid enum value for interfaceStrategy', () => {
    const configPath = path.join(tmpDir, '.sddrc.json');
    fs.writeFileSync(configPath, JSON.stringify({ interfaceStrategy: 'grp' }));
    const warnings = [];
    mock.method(console, 'warn', (...args) => warnings.push(args.join(' ')));
    try {
      loadConfig(tmpDir);
    } finally {
      mock.restoreAll();
    }
    assert.ok(
      warnings.some((w) => w.includes('grp')),
      'should warn about invalid strategy',
    );
  });

  it('should warn on type mismatch for array field', () => {
    const configPath = path.join(tmpDir, '.sddrc.json');
    fs.writeFileSync(configPath, JSON.stringify({ requiredFiles: 'not-an-array' }));
    const warnings = [];
    mock.method(console, 'warn', (...args) => warnings.push(args.join(' ')));
    try {
      loadConfig(tmpDir);
    } finally {
      mock.restoreAll();
    }
    assert.ok(
      warnings.some((w) => w.includes('requiredFiles')),
      'should warn about type mismatch',
    );
  });

  it('should warn on unknown config keys', () => {
    const configPath = path.join(tmpDir, '.sddrc.json');
    fs.writeFileSync(configPath, JSON.stringify({ unknownKey: 'value' }));
    const warnings = [];
    mock.method(console, 'warn', (...args) => warnings.push(args.join(' ')));
    try {
      loadConfig(tmpDir);
    } finally {
      mock.restoreAll();
    }
    assert.ok(warnings.some((w) => w.includes('unknownKey')));
  });
});
