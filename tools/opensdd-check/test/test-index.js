'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('index.js module interfaces', () => {
  it('all check modules should load as functions', () => {
    const filesCheck = require('../checks/files');
    const planCheck = require('../checks/plan');
    const matrixCheck = require('../checks/matrix');
    const garbageCheck = require('../checks/garbage');
    const agentsCheck = require('../checks/agents');
    const frontmatterCheck = require('../checks/frontmatter');
    const moduleContentCheck = require('../checks/module-content');

    assert.strictEqual(typeof filesCheck, 'function');
    assert.strictEqual(typeof planCheck, 'function');
    assert.strictEqual(typeof matrixCheck, 'function');
    assert.strictEqual(typeof garbageCheck, 'function');
    assert.strictEqual(typeof agentsCheck, 'function');
    assert.strictEqual(typeof frontmatterCheck, 'function');
    assert.strictEqual(typeof moduleContentCheck, 'function');
  });
});
