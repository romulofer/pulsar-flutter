'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({ presets: ['@babel/preset-env'] });
const { runProcessCapturingOutput } = require('./run-to-completion');

test('resolves success:true with captured stdout on exit code 0', async () => {
  const result = await runProcessCapturingOutput('node', ['-e', "console.log('hi')"]);
  assert.equal(result.success, true);
  assert.match(result.output, /hi/);
});

test('resolves success:false on nonzero exit code', async () => {
  const result = await runProcessCapturingOutput('node', ['-e', 'process.exit(1)']);
  assert.equal(result.success, false);
});

test('resolves success:false when the command cannot be spawned', async () => {
  const result = await runProcessCapturingOutput('this-binary-does-not-exist-xyz', []);
  assert.equal(result.success, false);
});

test('never resolves before the process actually finishes', async () => {
  let resolved = false;
  const promise = runProcessCapturingOutput('node', ['-e', 'setTimeout(() => process.exit(0), 100)'])
    .then((result) => { resolved = true; return result; });

  // Give the process time to spawn but not to finish (it sleeps 100ms).
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(resolved, false, 'must not resolve while the child process is still running');

  const result = await promise;
  assert.equal(resolved, true);
  assert.equal(result.success, true);
});
