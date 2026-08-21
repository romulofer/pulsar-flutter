'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({ presets: ['@babel/preset-env'] });
const { wireDiagnostics } = require('./diagnostics');

function fakeClient() {
  const handlers = {};
  return {
    handlers,
    onNotification(method, handler) {
      handlers[method] = handler;
      return { dispose() { delete handlers[method]; } };
    },
  };
}

test('maps LSP diagnostics to linter-indie messages', () => {
  const client = fakeClient();
  const setMessagesCalls = [];
  const linter = { setMessages: (filePath, messages) => setMessagesCalls.push({ filePath, messages }) };

  wireDiagnostics(client, linter);
  client.handlers['textDocument/publishDiagnostics']({
    uri: 'file:///proj/lib/main.dart',
    diagnostics: [
      {
        severity: 1,
        message: 'Undefined name x.',
        range: { start: { line: 2, character: 4 }, end: { line: 2, character: 5 } },
      },
      {
        severity: 2,
        message: 'Unused import.',
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 10 } },
      },
    ],
  });

  assert.equal(setMessagesCalls.length, 1);
  const { filePath, messages } = setMessagesCalls[0];
  assert.equal(filePath, '/proj/lib/main.dart');
  assert.equal(messages.length, 2);
  assert.equal(messages[0].severity, 'error');
  assert.equal(messages[0].excerpt, 'Undefined name x.');
  assert.deepEqual(messages[0].location.position, [[2, 4], [2, 5]]);
  assert.equal(messages[1].severity, 'warning');
});

test('does nothing when no linter is registered yet', () => {
  const client = fakeClient();
  wireDiagnostics(client, null);
  assert.doesNotThrow(() => {
    client.handlers['textDocument/publishDiagnostics']({ uri: 'file:///a.dart', diagnostics: [] });
  });
});
