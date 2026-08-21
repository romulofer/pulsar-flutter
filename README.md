# 🎯 pulsar-flutter

![versão](https://img.shields.io/badge/versão-0.1.0-blue) ![licença](https://img.shields.io/badge/licença-MIT-green) ![status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

Suporte moderno a **Dart** e **Flutter** para o editor [Pulsar](https://pulsar-edit.dev/) 🚀

> ⚠️ Em Fase 4 (Teste). Funcional, aguardando validação em ambiente real antes da publicação.

---

## ✨ Funcionalidades

| Recurso | Descrição |
|---|---|
| 🎨 Syntax highlighting | Grammar tree-sitter para Dart, com fold, indent e brackets |
| 🩺 Diagnostics | Erros e warnings do Dart Analysis Server em tempo real (LSP) |
| 💡 Autocomplete | Sugestões de código via LSP |
| 🔍 Hover & Go to Definition | Inspeção rápida e navegação de símbolos |
| ▶️ Run/Debug | Executa apps Flutter em device/emulador via `flutter run --machine` |
| ⚡ Hot Reload / Hot Restart | Atualização instantânea durante o desenvolvimento |
| 📱 Device Picker | Lista e seleciona dispositivos/emuladores conectados |
| 🛠️ Ferramentas | `flutter doctor`, `flutter create`, `flutter screenshot` direto do editor |

## 📋 Requisitos

- [Pulsar](https://pulsar-edit.dev/) instalado
- [Dart SDK](https://dart.dev/get-dart) e [Flutter SDK](https://docs.flutter.dev/get-started/install) instalados e no `PATH` (ou configurados nas settings do pacote)

## 📦 Instalação

Via `ppm` (Pulsar Package Manager):

```bash
ppm install pulsar-flutter
```

Ou pela interface: `Settings > Install`, buscar por `pulsar-flutter`.

## ⚙️ Configuração

Em `Settings > Packages > pulsar-flutter`:

| Opção | Descrição | Padrão |
|---|---|---|
| `dartSdkPath` | Caminho do Dart SDK. Vazio = resolve `dart` do PATH | `""` |
| `flutterSdkPath` | Caminho do Flutter SDK. Vazio = resolve `flutter` do PATH | `""` |
| `useFvm` | Resolve binários via FVM (Flutter Version Management) | `false` |
| `formatOnSave` | Formata o arquivo ao salvar | `true` |
| `codeActionsOnFormat` | Code actions do LSP aplicadas junto com a formatação | `organizeImports`, `fixAll` |

## ⌨️ Comandos e atalhos

| Atalho | Comando | Ação |
|---|---|---|
| `Ctrl+Alt+H` | `dart:show-hover-info` | Mostra info do símbolo sob o cursor |
| `F12` | `dart:go-to-definition` | Vai para definição do símbolo |
| `Ctrl+Alt+R` | `flutter:run` | Roda o app em modo debug |
| `Ctrl+Alt+Shift+R` | `flutter:hot-reload` | Hot reload |
| `Ctrl+Alt+Shift+O` | `flutter:hot-restart` | Hot restart |
| `Ctrl+Alt+Shift+Q` | `flutter:stop` | Para o app |
| `Ctrl+Alt+D` | `flutter:select-device` | Seleciona device/emulador |

Também disponíveis: `flutter:run-release`, `flutter:run-profile`, `flutter:doctor`, `flutter:create-project`, `flutter:screenshot` — via Command Palette ou menu `Packages > Flutter`.

## 🧪 Testes

```bash
npm install
npm run test:unit   # testes unitários (Node, sem dependência do Pulsar)
npm run test:atom   # specs de integração dentro do Pulsar
```

Roteiro de teste manual/instrumentação em [test/e2e/roteiro-manual.md](test/e2e/roteiro-manual.md).

## 📚 Documentação de desenvolvimento

- [docs/spec.md](docs/spec.md) — especificação do escopo
- [docs/plan.md](docs/plan.md) — plano de execução por etapas

## 🤝 Contribuindo

Issues e PRs são bem-vindos no [repositório no GitHub](https://github.com/romulofer/pulsar-flutter).

## 📄 Licença

[MIT](LICENSE)

<br>

---

<br>

# 🎯 pulsar-flutter (English)

![version](https://img.shields.io/badge/version-0.1.0-blue) ![license](https://img.shields.io/badge/license-MIT-green) ![status](https://img.shields.io/badge/status-in%20development-yellow)

Modern **Dart** and **Flutter** support for the [Pulsar](https://pulsar-edit.dev/) editor 🚀

> ⚠️ In Phase 4 (Testing). Functional, awaiting real-environment validation before publishing.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎨 Syntax highlighting | Tree-sitter grammar for Dart, with fold, indent and brackets |
| 🩺 Diagnostics | Real-time errors/warnings from the Dart Analysis Server (LSP) |
| 💡 Autocomplete | Code suggestions via LSP |
| 🔍 Hover & Go to Definition | Quick symbol inspection and navigation |
| ▶️ Run/Debug | Runs Flutter apps on a device/emulator via `flutter run --machine` |
| ⚡ Hot Reload / Hot Restart | Instant updates while developing |
| 📱 Device Picker | Lists and selects connected devices/emulators |
| 🛠️ Tooling | `flutter doctor`, `flutter create`, `flutter screenshot` right from the editor |

## 📋 Requirements

- [Pulsar](https://pulsar-edit.dev/) installed
- [Dart SDK](https://dart.dev/get-dart) and [Flutter SDK](https://docs.flutter.dev/get-started/install) installed and on `PATH` (or configured in the package's settings)

## 📦 Installation

Via `ppm` (Pulsar Package Manager):

```bash
ppm install pulsar-flutter
```

Or through the UI: `Settings > Install`, search for `pulsar-flutter`.

## ⚙️ Configuration

Under `Settings > Packages > pulsar-flutter`:

| Option | Description | Default |
|---|---|---|
| `dartSdkPath` | Path to the Dart SDK. Empty = resolve `dart` from PATH | `""` |
| `flutterSdkPath` | Path to the Flutter SDK. Empty = resolve `flutter` from PATH | `""` |
| `useFvm` | Resolve binaries through FVM (Flutter Version Management) | `false` |
| `formatOnSave` | Format the file on save | `true` |
| `codeActionsOnFormat` | LSP code actions applied alongside formatting | `organizeImports`, `fixAll` |

## ⌨️ Commands & keybindings

| Shortcut | Command | Action |
|---|---|---|
| `Ctrl+Alt+H` | `dart:show-hover-info` | Show info for the symbol under the cursor |
| `F12` | `dart:go-to-definition` | Go to the symbol's definition |
| `Ctrl+Alt+R` | `flutter:run` | Run the app in debug mode |
| `Ctrl+Alt+Shift+R` | `flutter:hot-reload` | Hot reload |
| `Ctrl+Alt+Shift+O` | `flutter:hot-restart` | Hot restart |
| `Ctrl+Alt+Shift+Q` | `flutter:stop` | Stop the app |
| `Ctrl+Alt+D` | `flutter:select-device` | Select a device/emulator |

Also available: `flutter:run-release`, `flutter:run-profile`, `flutter:doctor`, `flutter:create-project`, `flutter:screenshot` — via the Command Palette or the `Packages > Flutter` menu.

## 🧪 Testing

```bash
npm install
npm run test:unit   # unit tests (Node, no Pulsar dependency)
npm run test:atom   # integration specs inside Pulsar
```

Manual/instrumentation test script at [test/e2e/roteiro-manual.md](test/e2e/roteiro-manual.md).

## 📚 Development docs

- [docs/spec.md](docs/spec.md) — scope specification
- [docs/plan.md](docs/plan.md) — step-by-step execution plan

## 🤝 Contributing

Issues and PRs are welcome on the [GitHub repository](https://github.com/romulofer/pulsar-flutter).

## 📄 License

[MIT](LICENSE)
