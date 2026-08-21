# Roteiro de teste manual/instrumentação — pulsar-flutter

Pré-requisitos: Dart SDK e Flutter SDK instalados e no PATH (ou configurados em Settings > Packages > pulsar-flutter). Pacote linkado localmente via `ppm link` na raiz do projeto.

Use o app fixture em `spec/fixtures/sample_app/` (`flutter pub get` primeiro) ou um projeto Flutter próprio.

## 1. Grammar / syntax highlighting

- [ ] Abrir `spec/fixtures/sample_app/lib/main.dart`.
- [ ] Confirmar destaque de sintaxe (keywords, strings, tipos, comentários).
- [ ] Testar fold de `class`/`build()` (clicar na gutter).
- [ ] Testar indentação automática ao abrir `{` e pressionar Enter.

## 2. LSP — diagnostics/autocomplete/hover/definition

- [ ] Introduzir um erro (ex: variável não declarada) e confirmar diagnóstico via linter (gutter vermelho + painel do linter).
- [ ] Digitar `Text(` e confirmar sugestões de autocomplete.
- [ ] Posicionar cursor em um símbolo (ex: `Scaffold`) e rodar `dart:show-hover-info` (Ctrl+Alt+H) — confirmar notificação com info.
- [ ] Rodar `dart:go-to-definition` (F12) em `StatelessWidget` — confirmar navegação (se SDK sources disponíveis).
- [ ] Salvar arquivo com `formatOnSave` ativo — confirmar formatação automática.

## 3. Flutter run/debug/hot reload

- [ ] Conectar emulador/dispositivo ou iniciar Chrome como device.
- [ ] `flutter:select-device` (Ctrl+Alt+D) — confirmar lista de devices aparece.
- [ ] Selecionar device — confirmar tile na status bar atualiza.
- [ ] `flutter:run` (Ctrl+Alt+R) — confirmar app inicia no device, notificação "App started.".
- [ ] Alterar algo visível no `main.dart` — `flutter:hot-reload` (Ctrl+Alt+Shift+R) — confirmar mudança aparece sem perder estado (contador).
- [ ] `flutter:hot-restart` (Ctrl+Alt+Shift+O) — confirmar reinício completo (estado zera).
- [ ] `flutter:stop` (Ctrl+Alt+Shift+Q) — confirmar app encerra, notificação "App stopped.".

## 4. Flutter daemon / ferramentas

- [ ] `flutter:doctor` — confirmar saída abre em editor novo.
- [ ] `flutter:create-project` — informar nome, confirmar projeto criado na pasta do workspace.
- [ ] `flutter:screenshot` (com device rodando) — confirmar arquivo PNG salvo na raiz do projeto.

## 5. Regressão

- [ ] Abrir arquivo `.dart` em projeto sem `pubspec.yaml` — confirmar que não trava/crasha o editor.
- [ ] Desativar/reativar o pacote (`Settings > Packages`) — confirmar não deixa processos `dart`/`flutter` órfãos (checar `ps aux | grep dart`).
- [ ] Fechar Pulsar com sessão de run ativa — confirmar processo Flutter é encerrado junto.
