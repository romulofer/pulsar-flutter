'use babel';

import path from 'path';

const BIN_NAME = process.platform === 'win32' ? 'dart.exe' : 'dart';

/**
 * Resolves the `dart` binary to spawn the language server with, honoring
 * the `dartSdkPath` / `useFvm` settings before falling back to PATH.
 */
export function resolveDartCommand() {
  const useFvm = atom.config.get('pulsar-flutter.useFvm');
  if (useFvm) {
    return { command: 'fvm', args: ['dart'] };
  }

  const sdkPath = atom.config.get('pulsar-flutter.dartSdkPath');
  if (sdkPath && sdkPath.trim().length > 0) {
    return { command: path.join(sdkPath.trim(), 'bin', BIN_NAME), args: [] };
  }

  return { command: BIN_NAME, args: [] };
}

export function buildLanguageServerCommand() {
  const { command, args } = resolveDartCommand();
  return { command, args: [...args, 'language-server', '--protocol=lsp'] };
}
