'use babel';

import url from 'url';

export function pathToUri(filePath) {
  return url.pathToFileURL(filePath).toString();
}

export function uriToPath(uri) {
  return url.fileURLToPath(uri);
}

/**
 * Tracks open-document state (uri, version) per TextEditor and mirrors
 * buffer changes to the language server via full-document sync.
 */
export default class DocumentSync {
  constructor(client) {
    this.client = client;
    this.editors = new Map();
  }

  open(editor) {
    const filePath = editor.getPath();
    if (!filePath || this.editors.has(editor)) return;

    const uri = pathToUri(filePath);
    const version = 1;
    this.editors.set(editor, { uri, version });

    this.client.notify('textDocument/didOpen', {
      textDocument: {
        uri,
        languageId: 'dart',
        version,
        text: editor.getText(),
      },
    });
  }

  change(editor) {
    const state = this.editors.get(editor);
    if (!state) return;

    state.version += 1;
    this.client.notify('textDocument/didChange', {
      textDocument: { uri: state.uri, version: state.version },
      contentChanges: [{ text: editor.getText() }],
    });
  }

  save(editor) {
    const state = this.editors.get(editor);
    if (!state) return;

    this.client.notify('textDocument/didSave', {
      textDocument: { uri: state.uri },
      text: editor.getText(),
    });
  }

  close(editor) {
    const state = this.editors.get(editor);
    if (!state) return;

    this.client.notify('textDocument/didClose', {
      textDocument: { uri: state.uri },
    });
    this.editors.delete(editor);
  }

  uriFor(editor) {
    const state = this.editors.get(editor);
    return state ? state.uri : null;
  }
}
