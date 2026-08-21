'use babel';

import { CompositeDisposable } from 'atom';
import LspClient from './client';
import DocumentSync from './document-sync';
import { wireDiagnostics } from './diagnostics';
import { buildLanguageServerCommand } from './sdk';
import { pathToUri } from './document-sync';

const CODE_ACTIONS_ON_FORMAT = 'pulsar-flutter.codeActionsOnFormat';

/**
 * Owns the single Dart language server process for the current Pulsar
 * session, plus per-editor document sync and diagnostics wiring.
 */
export default class LspManager {
  constructor() {
    this.client = null;
    this.documentSync = null;
    this.linter = null;
    this.subscriptions = new CompositeDisposable();
    this.editorSubscriptions = new Map();
    this.initializePromise = null;
  }

  setLinter(linter) {
    this.linter = linter;
    if (this.client) {
      this.diagnosticsDisposable && this.diagnosticsDisposable.dispose();
      this.diagnosticsDisposable = wireDiagnostics(this.client, this.linter);
    }
  }

  async ensureStarted() {
    if (this.initializePromise) return this.initializePromise;

    const { command, args } = buildLanguageServerCommand();
    const roots = atom.project.getPaths();
    const cwd = roots[0] || process.cwd();

    this.client = new LspClient(command, args, { cwd });
    this.documentSync = new DocumentSync(this.client);

    this.initializePromise = new Promise((resolve, reject) => {
      const errorDisposable = this.client.onError((error) => reject(error));
      this.client.start();

      this.client
        .request('initialize', {
          processId: process.pid,
          rootUri: cwd ? pathToUri(cwd) : null,
          workspaceFolders: roots.map((root) => ({ uri: pathToUri(root), name: root })),
          capabilities: {
            textDocument: {
              synchronization: { didSave: true },
              completion: { completionItem: { snippetSupport: false } },
              hover: { contentFormat: ['plaintext'] },
              publishDiagnostics: {},
            },
            workspace: { workspaceFolders: true, configuration: true },
          },
          initializationOptions: {
            dart: {
              onlyAnalyzeProjectsWithOpenFiles: false,
              suggestFromUnimportedLibraries: true,
            },
          },
        })
        .then(() => {
          this.client.notify('initialized', {});
          errorDisposable.dispose();
          resolve(this.client);
        })
        .catch(reject);
    });

    if (this.linter) {
      this.diagnosticsDisposable = wireDiagnostics(this.client, this.linter);
    }

    return this.initializePromise;
  }

  async getClient() {
    await this.ensureStarted();
    return this.client;
  }

  async registerEditor(editor) {
    if (!editor.getPath() || !editor.getPath().endsWith('.dart')) return;
    if (this.editorSubscriptions.has(editor)) return;

    await this.ensureStarted();
    this.documentSync.open(editor);

    const disposables = new CompositeDisposable();
    disposables.add(editor.onDidStopChanging(() => this.documentSync.change(editor)));
    disposables.add(editor.onDidSave(() => this._onSave(editor)));
    disposables.add(editor.onDidDestroy(() => {
      this.documentSync.close(editor);
      this.editorSubscriptions.delete(editor);
      disposables.dispose();
    }));

    this.editorSubscriptions.set(editor, disposables);
  }

  async _onSave(editor) {
    this.documentSync.save(editor);

    if (!atom.config.get('pulsar-flutter.formatOnSave')) return;

    const client = await this.getClient();
    const uri = this.documentSync.uriFor(editor);
    if (!uri) return;

    try {
      const edits = await client.request('textDocument/formatting', {
        textDocument: { uri },
        options: { tabSize: 2, insertSpaces: true },
      });
      this._applyTextEdits(editor, edits);

      const kinds = atom.config.get(CODE_ACTIONS_ON_FORMAT) || [];
      if (kinds.length > 0) {
        await this._applyCodeActions(editor, uri, kinds);
      }
    } catch (error) {
      // Formatting is best-effort; surface nothing on failure.
    }
  }

  _applyTextEdits(editor, edits) {
    if (!edits || edits.length === 0) return;
    editor.transact(() => {
      for (const edit of edits) {
        const range = [
          [edit.range.start.line, edit.range.start.character],
          [edit.range.end.line, edit.range.end.character],
        ];
        editor.setTextInBufferRange(range, edit.newText);
      }
    });
  }

  async _applyCodeActions(editor, uri, kinds) {
    const client = await this.getClient();
    const actions = await client.request('textDocument/codeAction', {
      textDocument: { uri },
      range: {
        start: { line: 0, character: 0 },
        end: { line: editor.getLastBufferRow(), character: 0 },
      },
      context: { diagnostics: [], only: kinds },
    });

    for (const action of actions || []) {
      if (action.edit && action.edit.changes && action.edit.changes[uri]) {
        this._applyTextEdits(editor, action.edit.changes[uri]);
      }
    }
  }

  dispose() {
    this.diagnosticsDisposable && this.diagnosticsDisposable.dispose();
    for (const disposables of this.editorSubscriptions.values()) {
      disposables.dispose();
    }
    this.editorSubscriptions.clear();
    this.subscriptions.dispose();
    if (this.client) {
      this.client.stop();
      this.client = null;
    }
    this.initializePromise = null;
  }
}
