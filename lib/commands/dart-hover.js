'use babel';

function extractContents(contents) {
  if (!contents) return '';
  if (typeof contents === 'string') return contents;
  if (Array.isArray(contents)) return contents.map(extractContents).join('\n\n');
  if (contents.value) return contents.value;
  return '';
}

export function registerHoverCommand(manager) {
  return atom.commands.add('atom-text-editor[data-grammar="source dart"]', {
    'dart:show-hover-info': async (event) => {
      const editor = event.currentTarget.getModel();
      const uri = manager.documentSync && manager.documentSync.uriFor(editor);
      if (!uri) return;

      const position = editor.getCursorBufferPosition();
      const client = await manager.getClient();

      let result;
      try {
        result = await client.request('textDocument/hover', {
          textDocument: { uri },
          position: { line: position.row, character: position.column },
        });
      } catch (error) {
        return;
      }

      const text = extractContents(result && result.contents);
      if (text) {
        atom.notifications.addInfo('Dart', { description: text, dismissable: true });
      }
    },
  });
}
