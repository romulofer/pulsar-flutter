'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({ presets: ['@babel/preset-env'] });
const { buildRunArgs, buildAttachArgs } = require('./run-args');

test('buildRunArgs: minimal config', () => {
  assert.deepEqual(buildRunArgs({}), ['run', '--machine']);
});

test('buildRunArgs: program and device', () => {
  assert.deepEqual(
    buildRunArgs({ program: 'lib/main.dart', deviceId: 'emulator-5554' }),
    ['run', '--machine', '-t', 'lib/main.dart', '-d', 'emulator-5554'],
  );
});

test('buildRunArgs: release mode adds --release', () => {
  assert.deepEqual(
    buildRunArgs({ flutterMode: 'release' }),
    ['run', '--machine', '--release'],
  );
});

test('buildRunArgs: debug mode adds no extra flag', () => {
  assert.deepEqual(buildRunArgs({ flutterMode: 'debug' }), ['run', '--machine']);
});

test('buildRunArgs: stopOnEntry adds --start-paused', () => {
  assert.deepEqual(
    buildRunArgs({ stopOnEntry: true }),
    ['run', '--machine', '--start-paused'],
  );
});

test('buildRunArgs: extra args appended last', () => {
  assert.deepEqual(
    buildRunArgs({ deviceId: 'chrome', args: ['--web-port=9000'] }),
    ['run', '--machine', '-d', 'chrome', '--web-port=9000'],
  );
});

test('buildAttachArgs: with device and vm service uri', () => {
  assert.deepEqual(
    buildAttachArgs({ deviceId: 'emulator-5554', vmServiceUri: 'http://127.0.0.1:1234/' }),
    ['attach', '--machine', '-d', 'emulator-5554', '--debug-uri', 'http://127.0.0.1:1234/'],
  );
});
