'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({ presets: ['@babel/preset-env'] });
const { buildDoctorArgs, buildCreateProjectArgs, buildScreenshotArgs } = require('./tool-args');

test('buildDoctorArgs', () => {
  assert.deepEqual(buildDoctorArgs(), ['doctor']);
});

test('buildCreateProjectArgs', () => {
  assert.deepEqual(buildCreateProjectArgs('my_app'), ['create', 'my_app']);
});

test('buildScreenshotArgs: no options', () => {
  assert.deepEqual(buildScreenshotArgs(), ['screenshot']);
});

test('buildScreenshotArgs: device and out path', () => {
  assert.deepEqual(
    buildScreenshotArgs({ deviceId: 'emulator-5554', outPath: '/tmp/shot.png' }),
    ['screenshot', '-d', 'emulator-5554', '--out', '/tmp/shot.png'],
  );
});
