# Plano de Execução — pulsar-flutter

Referência: `docs/spec.md`. Ordem sequencial, cada etapa testável isoladamente.

## Etapa 0 — Estrutura do projeto

- `package.json` (manifest Pulsar): nome, `configSchema` (dartSdkPath, flutterSdkPath, useFvm, formatOnSave), `package-deps`, `consumedServices`, `providedServices`.
- Estrutura de pastas:
  ```
  lib/
    main.js              # activate/deactivate
    lsp/                 # cliente LSP
    flutter/             # daemon, DAP, comandos
    grammar/             # se não usar grammars/ na raiz
    commands/
  grammars/
    tree-sitter-dart/    # parser + queries
    modern-tree-sitter-dart.cson
  settings/
    dart.cson
  spec/                  # testes unitários/integração
  test/e2e/               # testes e2e/instrumentação
  ```
- `.gitignore`, `LICENSE`, `README.md` (esqueleto, português seguido de inglês num só arquivo).

## Etapa 1 — Grammar (tree-sitter-dart)

- Vendorizar/adaptar `tree-sitter-dart` (grammar.js compilado ou `.wasm`) e queries do `zed-dart`.
- Criar `grammars/modern-tree-sitter-dart.cson` seguindo modelo `language-rust-bundled`.
- Criar `settings/dart.cson` (comentários `//`, `/* */`, indentação 2 espaços, brackets).
- Teste: abrir arquivo `.dart` no Pulsar local, validar scopes via `atom.grammars`.

## Etapa 2 — Cliente LSP Dart

- `lib/lsp/client.js`: spawn `dart language-server --protocol=lsp`, transporte JSON-RPC stdio, handshake `initialize`/`initialized`.
- `lib/lsp/diagnostics.js`: publishDiagnostics → `linter-indie`.
- `lib/lsp/autocomplete.js`: `textDocument/completion` → provider `autocomplete.provider`.
- `lib/lsp/hover.js`, `lib/lsp/definition.js`, `lib/lsp/outline.js` (symbols-view).
- `configSchema`: `dartSdkPath`, `formatOnSave`, `codeActionsOnFormat`.
- Testes unitários: parsing de mensagens LSP, mapeamento diagnostics/completion (mock do processo).
- Teste de integração: subir servidor real contra fixture de projeto Dart, validar diagnostics recebidos.

## Etapa 3 — Flutter DAP (run/debug/hot reload)

- `lib/flutter/dap.js`: monta comando `flutter debug_adapter` / `dart debug_adapter` a partir de launch config.
- Schema de launch config (JSON) conforme spec.md.
- Comandos Pulsar: `flutter:run`, `flutter:debug`, `flutter:hot-reload`, `flutter:hot-restart`, `flutter:stop`.
- Testes: construção do comando/args a partir de configs variadas (unitário), fluxo completo contra app Flutter fixture (integração).

## Etapa 4 — Flutter daemon

- `lib/flutter/daemon.js`: spawn `flutter daemon`, parser de eventos JSON-RPC (`device.added`, `device.removed`, `device.changed`).
- UI de device picker (status-bar ou tool-bar, dependendo do consumedServices disponível).
- Comandos: `flutter:create-project`, `flutter:doctor`, `flutter:screenshot`.
- Testes: parser de eventos do daemon (unitário com fixtures de payload), comando end-to-end contra Flutter SDK real.

## Etapa 5 — Testes e2e/instrumentação

- Instalar pacote localmente no Pulsar (`ppm link` ou equivalente).
- Roteiro manual/instrumentado: abrir projeto Flutter fixture, validar highlight, diagnostics, autocomplete, hot reload, device picker.
- Automatizar o que for possível via Pulsar's spec runner (headless).

## Etapa 6 — Documentação e publicação

- `README.md`: instalação, configuração, screenshots, badges, identidade visual (português antes do inglês, mesmo arquivo).
- Validar critérios de aceite do `CLAUDE.md`.
- Aguardar testes do usuário em ambiente local (Fase 4) antes de publicar (Fase 5: pulsar registry + GitHub `romulofer/pulsar-flutter`).

## Dependências externas assumidas

- Dart SDK e Flutter SDK instalados pelo usuário (binários `dart`, `flutter` no PATH ou configurados).
- Nenhum binário de LSP/DAP é bundlado no pacote.
