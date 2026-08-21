## Provenance

`tree-sitter-dart.wasm` here is the wasm bundled in the npm package
[`tree-sitter-dart@1.0.0`](https://www.npmjs.com/package/tree-sitter-dart)
(published 2023-02-24), **not** a fresh build from
[UserNobody14/tree-sitter-dart](https://github.com/UserNobody14/tree-sitter-dart)'s
current HEAD.

`queries/highlights.scm` and `queries/tags.scm` were originally copied
verbatim from that repo's current commit (`6922ad29141e819773d6ffb0c6d2c27adefb5acc`,
the same one `zed-extensions/dart` pins), matching what's documented in
`docs/spec.md`. `queries/folds.scm` and `queries/indents.scm` are written for
pulsar-flutter, adapted from the equivalent Dart queries in
[zed-extensions/dart](https://github.com/zed-extensions/dart).

### Why the wasm doesn't match the queries' source commit

Pulsar bundles `web-tree-sitter@0.20.7`, whose native runtime only accepts
grammars built for **tree-sitter language ABI 13 or 14**
(`Incompatible language version N. Compatibility range 13 through 14.`).

- The current HEAD of `UserNobody14/tree-sitter-dart` (and the `tree-sitter-wasms`
  npm bundle, which rebuilds from published grammar sources) both ship ABI 15
  wasm — Pulsar's `Parser#setLanguage` rejects them outright, so the grammar
  silently never loads and `.dart` files render as plain text.
- Rebuilding the current `grammar.js` at ABI 14 locally (via
  `tree-sitter-cli@0.20.8` + its Docker/Emscripten `build-wasm` step) produces
  a wasm whose `dylink.0` section isn't accepted by Pulsar's older
  `web-tree-sitter` loader either (`Assertion failed: undefined` on load) —
  the emscripten toolchain used for side-module linking has to match much
  more closely than just the language ABI number, and reproducing that exact
  toolchain wasn't practical here.
- The `tree-sitter-dart@1.0.0` npm package's wasm **does** load cleanly under
  `web-tree-sitter@0.20.7` (confirmed against Pulsar's actual vendored
  runtime, not just an isolated test) and successfully parses real Dart/Flutter
  code with zero parse errors.

### Consequence: a handful of keywords aren't specially highlighted

That npm package's wasm was built from an older grammar snapshot (predates
Dart 3's pattern-matching and extension-type syntax). To keep
`queries/highlights.scm` and `queries/tags.scm` loading without errors
against it:

- `final` and `case` are highlighted via `(final_builtin)` / `(case_builtin)`
  instead of the bare `"final"` / `"case"` string literals used upstream
  (those literal tokens aren't independently queryable in this grammar build).
- `assert`, `break`, `rethrow`, `part of`, and the Dart 3+ block (extension
  types, switch guards, object/record patterns, record types) are not
  specially colored — those literal tokens or node types don't exist in this
  older grammar. They still parse fine as plain text, just without a
  dedicated `@keyword`/`@type` capture.
- `tags.scm`'s `mixin_declaration` pattern and its two `"!"?` (null-assertion)
  optional clauses were dropped for the same reason.

If Pulsar ever bundles a newer `web-tree-sitter` (ABI 15+), swap this wasm
for a fresh build off current HEAD and revert `docs/plan.md`'s Etapa 1 diffs
in `highlights.scm`/`tags.scm` (see git history) to restore full coverage.

See `LICENSE` for the upstream grammar's license.
