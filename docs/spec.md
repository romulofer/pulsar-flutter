# Especificação — pulsar-flutter

## Objetivo

Pacote único para o editor Pulsar que adiciona suporte moderno a Dart e Flutter: destaque de sintaxe, integração com o Dart Analysis Server via LSP, e ferramentas Flutter (execução, debug, hot reload, gerenciamento de dispositivos).

## Escopo (MVP)

1. **Grammar tree-sitter para Dart**
   - Formato `modern-tree-sitter` do Pulsar (padrão `language-rust-bundled`).
   - Parser `tree-sitter-dart` (adaptado de `UserNobody14/tree-sitter-dart`, referência via `zed-dart`).
   - Queries: `highlights.scm`, `folds.scm`, `indents.scm`, `brackets.scm`, `injections.scm`, `outline.scm` (tags), `runnables.scm`.
   - Arquivo de settings (`settings/dart.cson`): delimitadores de comentário, indentação, bracket-matcher.

2. **Cliente LSP — Dart Analysis Server**
   - Spawna `dart language-server --protocol=lsp` (path configurável via `configSchema`, default resolvido de `dartSdkPath`/PATH).
   - Cliente LSP mínimo próprio (sem `atom-languageclient` disponível no Pulsar): JSON-RPC via stdio.
   - Wiring para serviços consumidos do Pulsar:
     - Diagnostics → `linter-indie`
     - Autocomplete → `autocomplete.provider` (v2.0.0), rótulos ricos (classe/função/propriedade/variável)
     - Hover, go-to-definition, outline/symbols → `symbols-view` / `status-bar`
     - Busy state → `atom-ide-busy-signal` (se presente) ou `busy-signal`
   - `initializationOptions` / `workspace/configuration`: `{"dart": {...}}` incluindo `format_on_save`, `code_actions_on_format: [source.organizeImports, source.fixAll]`.

3. **Flutter run/debug + hot reload**
   - DAP via `flutter debug_adapter` (Flutter) / `dart debug_adapter` (Dart puro).
   - Config de launch: `type` (dart|flutter), `request` (launch|attach), `program`, `args`, `cwd`, `flutterMode` (debug|profile|release), `platform`, `deviceId` (repassado via `toolArgs -d <id>`), `vmServiceUri`, `stopOnEntry`, `useFvm`.
   - Comando `flutter:hot-reload`, `flutter:hot-restart`.

4. **Flutter daemon**
   - Spawna `flutter daemon`, parseia JSON-RPC sobre stdio.
   - Lista de dispositivos (add/change/remove) exposta em UI (device picker na status-bar ou tool-bar).
   - Comandos: `flutter:create-project`, `flutter:doctor`, `flutter:screenshot`.

## Fora de escopo (MVP)

- Integração pub.dev (busca/instalação de pacotes na UI).
- Widget preview / DevTools embutido.
- Suporte a Observatory/Chrome DevTools debugger legado.

## Requisitos técnicos

- `package.json` no formato Pulsar: `configSchema`, `package-deps` (dependências soft, ex: `linter`, `busy-signal`), `consumedServices`, `providedServices`.
- Código modular: `lib/lsp/`, `lib/flutter/`, `lib/grammar/` (ou grammar bundlada), `lib/commands/`.
- Testes unitários e de integração para cliente LSP, parser de mensagens do daemon, e comandos.
- Testes e2e/instrumentação rodando o pacote instalado em Pulsar local.
- Arquivos de teste terminam em `.test.js` (ou extensão equivalente da linguagem usada).

## Critérios de aceite

Ver `CLAUDE.md` na raiz do projeto — critérios gerais de aceite, boas práticas, e processo (spec → plan → execução) se aplicam a toda nova feature/bugfix/doc.
