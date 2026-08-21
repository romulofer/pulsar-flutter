'use babel';

const KIND_TO_TYPE = {
  1: 'import', // Text
  2: 'method',
  3: 'function',
  4: 'constructor',
  5: 'property',
  6: 'variable',
  7: 'class',
  8: 'interface',
  9: 'module',
  10: 'property',
  11: 'value',
  12: 'value',
  13: 'type',
  14: 'keyword',
  21: 'constant',
};

export function createAutocompleteProvider(manager) {
  return {
    selector: '.source.dart',
    disableForSelector: '.source.dart .comment',
    inclusionPriority: 1,
    suggestionPriority: 2,
    excludeLowerPriority: false,

    async getSuggestions({ editor, bufferPosition, prefix }) {
      const uri = manager.documentSync && manager.documentSync.uriFor(editor);
      if (!uri) return [];

      const client = await manager.getClient();
      let result;
      try {
        result = await client.request('textDocument/completion', {
          textDocument: { uri },
          position: { line: bufferPosition.row, character: bufferPosition.column },
        });
      } catch (error) {
        return [];
      }

      const items = Array.isArray(result) ? result : (result && result.items) || [];
      return items.slice(0, 100).map((item) => ({
        text: item.insertText || item.label,
        displayText: item.label,
        type: KIND_TO_TYPE[item.kind] || 'value',
        description: item.detail || '',
        replacementPrefix: prefix,
      }));
    },
  };
}

export default createAutocompleteProvider;
