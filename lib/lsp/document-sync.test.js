'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

require('@babel/register')({ presets: ['@babel/preset-env'] });
const { pathToUri, uriToPath } = require('./document-sync');

test('pathToUri/uriToPath round-trip a plain path', () => {
  const original = process.platform === 'win32' ? 'C:\\proj\\lib\\main.dart' : '/proj/lib/main.dart';
  assert.equal(uriToPath(pathToUri(original)), original);
});

test('pathToUri percent-encodes spaces', () => {
  const withSpace = process.platform === 'win32' ? 'C:\\my proj\\a.dart' : '/my proj/a.dart';
  const uri = pathToUri(withSpace);
  assert.match(uri, /%20/);
  assert.equal(uriToPath(uri), withSpace);
});
