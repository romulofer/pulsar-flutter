'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

// Babel-transpiled ESM export lives under `.default` when required from CJS
// via @babel/register; fall back to the module itself otherwise.
require('@babel/register')({ presets: ['@babel/preset-env'] });
const LspClient = require('./client').default || require('./client');

function frame(payload) {
  const json = JSON.stringify(payload);
  return `Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`;
}

test('parses a single framed notification', () => {
  const client = new LspClient('dart', []);
  let received = null;
  client.onNotification('textDocument/publishDiagnostics', (params) => {
    received = params;
  });

  client._onData(Buffer.from(frame({ jsonrpc: '2.0', method: 'textDocument/publishDiagnostics', params: { uri: 'file:///a.dart', diagnostics: [] } })));

  assert.deepEqual(received, { uri: 'file:///a.dart', diagnostics: [] });
});

test('parses two messages arriving in one chunk', () => {
  const client = new LspClient('dart', []);
  const seen = [];
  client.onNotification('ping', (params) => seen.push(params));

  const combined = frame({ jsonrpc: '2.0', method: 'ping', params: { n: 1 } })
    + frame({ jsonrpc: '2.0', method: 'ping', params: { n: 2 } });
  client._onData(Buffer.from(combined));

  assert.deepEqual(seen, [{ n: 1 }, { n: 2 }]);
});

test('parses a message split across multiple chunks', () => {
  const client = new LspClient('dart', []);
  const seen = [];
  client.onNotification('ping', (params) => seen.push(params));

  const full = frame({ jsonrpc: '2.0', method: 'ping', params: { n: 42 } });
  const mid = Math.floor(full.length / 2);
  client._onData(Buffer.from(full.slice(0, mid)));
  client._onData(Buffer.from(full.slice(mid)));

  assert.deepEqual(seen, [{ n: 42 }]);
});

test('resolves a pending request on matching response id', () => {
  const client = new LspClient('dart', []);
  client.pending.set(1, {
    resolve: (result) => {
      assert.deepEqual(result, { ok: true });
    },
    reject: () => assert.fail('should not reject'),
  });

  client._onData(Buffer.from(frame({ jsonrpc: '2.0', id: 1, result: { ok: true } })));
  assert.equal(client.pending.has(1), false);
});

test('rejects a pending request on error response', () => {
  const client = new LspClient('dart', []);
  let rejected = false;
  client.pending.set(1, {
    resolve: () => assert.fail('should not resolve'),
    reject: () => { rejected = true; },
  });

  client._onData(Buffer.from(frame({ jsonrpc: '2.0', id: 1, error: { message: 'boom' } })));
  assert.equal(rejected, true);
});
