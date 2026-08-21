'use babel';

import { uriToPath } from './document-sync';

const SEVERITY_MAP = {
  1: 'error',
  2: 'warning',
  3: 'info',
  4: 'info',
};

// Atom's Range.fromObject accepts a plain [[row,col],[row,col]] array, so
// building one here keeps this module free of the 'atom' import (and thus
// unit-testable outside the editor process).
function toRange(lspRange) {
  return [
    [lspRange.start.line, lspRange.start.character],
    [lspRange.end.line, lspRange.end.character],
  ];
}

/**
 * Subscribes to `textDocument/publishDiagnostics` notifications and
 * republishes them through the given linter-indie delegate.
 */
export function wireDiagnostics(client, linter) {
  return client.onNotification('textDocument/publishDiagnostics', (params) => {
    if (!linter) return;

    const filePath = uriToPath(params.uri);
    const messages = (params.diagnostics || []).map((diagnostic) => ({
      severity: SEVERITY_MAP[diagnostic.severity] || 'info',
      location: {
        file: filePath,
        position: toRange(diagnostic.range),
      },
      excerpt: diagnostic.message,
      linterName: 'Dart',
    }));

    linter.setMessages(filePath, messages);
  });
}
