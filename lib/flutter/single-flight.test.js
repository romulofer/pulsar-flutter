'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({ presets: ['@babel/preset-env'] });
const SingleFlight = require('./single-flight').default;

test('a second concurrent call reuses the first in-flight run instead of starting another', async () => {
  const gate = new SingleFlight();
  let starts = 0;

  const run = () => gate.run(async () => {
    starts += 1;
    await new Promise((r) => setTimeout(r, 20));
    return starts;
  });

  const [a, b] = await Promise.all([run(), run()]);

  assert.equal(starts, 1, 'fn should only execute once for two concurrent calls');
  assert.equal(a, 1);
  assert.equal(b, 1);
});

test('a call made after the first settles starts a fresh run', async () => {
  const gate = new SingleFlight();
  let starts = 0;
  const run = () => gate.run(async () => { starts += 1; return starts; });

  await run();
  await run();

  assert.equal(starts, 2);
});
