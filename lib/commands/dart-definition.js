'use babel';

import { Point } from 'atom';
import { uriToPath } from '../lsp/document-sync';

export function registerDefinitionCommand(manager) {
  return atom.commands.add('atom-text-editor[data-grammar="source dart"]', {
    'dart:go-to-definition': async (event) => {
      const editor = event.currentTarget.getModel();
      const uri = manager.documentSync && manager.documentSync.uriFor(editor);
      if (!uri) return;

      const position = editor.getCursorBufferPosition();
      const client = await manager.getClient();

      let result;
      try {
        result = await client.request('textDocument/definition', {
          textDocument: { uri },
          position: { line: position.row, character: position.column },
        });
      } catch (error) {
        return;
      }

      const location = Array.isArray(result) ? result[0] : result;
      if (!location) return;

      const targetPath = uriToPath(location.uri);
      const targetPosition = new Point(location.range.start.line, location.range.start.character);
      atom.workspace.open(targetPath, { initialLine: targetPosition.row, initialColumn: targetPosition.column });
    },
  });
}
