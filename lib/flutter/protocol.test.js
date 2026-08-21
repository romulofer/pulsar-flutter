'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({ presets: ['@babel/preset-env'] });
const FlutterProtocolClient = require('./protocol').default;

test('parses a single event line', () => {
  const client = new FlutterProtocolClient('flutter', []);
  const seen = [];
  client.onEvent('app.start', (params) => seen.push(params));

  client._onChunk('[{"event":"app.start","params":{"appId":"1"}}]\n');

  assert.deepEqual(seen, [{ appId: '1' }]);
});

test('parses multiple lines arriving in one chunk', () => {
  const client = new FlutterProtocolClient('flutter', []);
  const seen = [];
  client.onEvent('app.log', (params) => seen.push(params));

  client._onChunk(
    '[{"event":"app.log","params":{"n":1}}]\n[{"event":"app.log","params":{"n":2}}]\n',
  );

  assert.deepEqual(seen, [{ n: 1 }, { n: 2 }]);
});

test('buffers a line split across chunks', () => {
  const client = new FlutterProtocolClient('flutter', []);
  const seen = [];
  client.onEvent('app.log', (params) => seen.push(params));

  const line = '[{"event":"app.log","params":{"n":42}}]\n';
  const mid = Math.floor(line.length / 2);
  client._onChunk(line.slice(0, mid));
  client._onChunk(line.slice(mid));

  assert.deepEqual(seen, [{ n: 42 }]);
});

test('ignores non-protocol banner lines', () => {
  const client = new FlutterProtocolClient('flutter', []);
  const seen = [];
  client.onEvent('app.start', (params) => seen.push(params));

  client._onChunk('Starting application...\n[{"event":"app.start","params":{}}]\n');

  assert.deepEqual(seen, [{}]);
});

test('resolves a pending request by id', () => {
  const client = new FlutterProtocolClient('flutter', []);
  client.pending.set(1, {
    resolve: (result) => assert.deepEqual(result, { deviceId: 'abc' }),
    reject: () => assert.fail('should not reject'),
  });

  client._onLine('[{"id":1,"result":{"deviceId":"abc"}}]');
  assert.equal(client.pending.has(1), false);
});

test('rejects a pending request on error', () => {
  const client = new FlutterProtocolClient('flutter', []);
  let rejected = false;
  client.pending.set(1, {
    resolve: () => assert.fail('should not resolve'),
    reject: () => { rejected = true; },
  });

  client._onLine('[{"id":1,"error":{"message":"boom"}}]');
  assert.equal(rejected, true);
});
