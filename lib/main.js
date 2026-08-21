'use babel';

import { CompositeDisposable } from 'atom';
import LspManager from './lsp/manager';
import { createAutocompleteProvider } from './lsp/autocomplete';
import { registerHoverCommand } from './commands/dart-hover';
import { registerDefinitionCommand } from './commands/dart-definition';
import FlutterRunner from './flutter/runner';
import FlutterDaemon from './flutter/daemon';
import DeviceState from './flutter/device-state';
import { registerFlutterRunCommands } from './commands/flutter-run';
import { registerFlutterToolCommands } from './commands/flutter-tools';

export default {
  subscriptions: null,
  manager: null,
  runner: null,
  daemon: null,
  deviceState: null,
  deviceStatusTile: null,

  activate() {
    this.subscriptions = new CompositeDisposable();
    this.manager = new LspManager();
    this.runner = new FlutterRunner();
    this.daemon = new FlutterDaemon();
    this.deviceState = new DeviceState();

    this.subscriptions.add(
      atom.workspace.observeTextEditors((editor) => {
        if (editor.getPath() && editor.getPath().endsWith('.dart')) {
          this.manager.registerEditor(editor);
        }
      }),
    );

    this.subscriptions.add(registerHoverCommand(this.manager));
    this.subscriptions.add(registerDefinitionCommand(this.manager));
    this.subscriptions.add(registerFlutterRunCommands(this.runner, this.deviceState));
    this.subscriptions.add(registerFlutterToolCommands(this.daemon, this.deviceState));
  },

  deactivate() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
      this.subscriptions = null;
    }
    if (this.manager) {
      this.manager.dispose();
      this.manager = null;
    }
    if (this.runner) {
      this.runner.dispose();
      this.runner = null;
    }
    if (this.daemon) {
      this.daemon.dispose();
      this.daemon = null;
    }
  },

  consumeHyperlinkInjection(hyperlink) {
    hyperlink.addInjectionPoint('source.dart', {
      types: ['comment', 'documentation_comment', 'string_literal'],
    });
  },

  consumeTodoInjection(todo) {
    todo.addInjectionPoint('source.dart', {
      types: ['comment', 'documentation_comment'],
    });
  },

  consumeLinterIndie(registerIndie) {
    this.linter = registerIndie({ name: 'Dart' });
    if (this.subscriptions) {
      this.subscriptions.add(this.linter);
    }
    if (this.manager) {
      this.manager.setLinter(this.linter);
    }
    return this.linter;
  },

  consumeBusySignal(busySignal) {
    this.busySignal = busySignal;
    return this.busySignal;
  },

  consumeStatusBar(statusBar) {
    this.statusBar = statusBar;

    const tile = document.createElement('div');
    tile.classList.add('inline-block', 'pulsar-flutter-device-tile');
    tile.textContent = 'Flutter: no device';
    tile.addEventListener('click', () => atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'flutter:select-device',
    ));

    if (this.deviceState) {
      this.subscriptions.add(this.deviceState.onChange(() => this._updateDeviceTile(tile)));
    }

    this.deviceStatusTile = statusBar.addRightTile({ item: tile, priority: 200 });
    this.subscriptions.add({ dispose: () => this.deviceStatusTile.destroy() });
  },

  _updateDeviceTile(tile) {
    const current = this.deviceState && this.deviceState.current;
    tile.textContent = current ? `Flutter: ${current.name}` : 'Flutter: no device';
  },

  provideAutocomplete() {
    return createAutocompleteProvider(this.manager);
  },
};
