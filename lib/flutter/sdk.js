'use babel';

import path from 'path';

const BIN_NAME = process.platform === 'win32' ? 'flutter.bat' : 'flutter';

export function resolveFlutterCommand() {
  const useFvm = atom.config.get('pulsar-flutter.useFvm');
  if (useFvm) {
    return { command: 'fvm', args: ['flutter'] };
  }

  const sdkPath = atom.config.get('pulsar-flutter.flutterSdkPath');
  if (sdkPath && sdkPath.trim().length > 0) {
    return { command: path.join(sdkPath.trim(), 'bin', BIN_NAME), args: [] };
  }

  return { command: BIN_NAME, args: [] };
}
