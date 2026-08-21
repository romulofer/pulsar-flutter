'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({ presets: ['@babel/preset-env'] });
const DeviceState = require('./device-state').default;

test('set() notifies listeners with the new device', () => {
  const state = new DeviceState();
  const seen = [];
  state.onChange((device) => seen.push(device));

  state.set({ id: 'a', name: 'Pixel' });

  assert.equal(state.current.id, 'a');
  assert.deepEqual(seen, [{ id: 'a', name: 'Pixel' }]);
});

test('disposing a listener stops further notifications', () => {
  const state = new DeviceState();
  const seen = [];
  const disposable = state.onChange((device) => seen.push(device));
  disposable.dispose();

  state.set({ id: 'b', name: 'Chrome' });

  assert.deepEqual(seen, []);
});
