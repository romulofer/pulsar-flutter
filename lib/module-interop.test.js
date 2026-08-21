'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Pulsar transpiles packages with babel-plugin-add-module-exports, which
// collapses `export default class Foo {}` (when it's the file's only
// export) into `module.exports = Foo` directly — dropping `.default`.
// A bare `require('./foo').default` then resolves to `undefined` and
// `new undefined()` throws "Foo is not a constructor" — this crashed
// pulsar-flutter's activation via device-list-view.js's SingleFlight
// import. Guard against ever reintroducing an unguarded `.default` access
// on a manual require() (ES `import` statements are unaffected — Babel's
// import interop already handles both module shapes correctly).
function listJsFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listJsFiles(full));
    else if (entry.name.endsWith('.js') && !entry.name.endsWith('.test.js')) out.push(full);
  }
  return out;
}

test('no manual require(...).default without a fallback', () => {
  const libDir = path.join(__dirname);
  const offenders = [];

  for (const file of listJsFiles(libDir)) {
    const src = fs.readFileSync(file, 'utf8');
    const re = /require\(['"][^'"]+['"]\)\.default\b/g;
    let match;
    while ((match = re.exec(src))) {
      const tail = src.slice(match.index, match.index + match[0].length + 40);
      if (!/\|\|/.test(tail)) {
        offenders.push(`${path.relative(libDir, file)}: ${match[0]}`);
      }
    }
  }

  assert.deepEqual(offenders, []);
});
