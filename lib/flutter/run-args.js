'use babel';

const MODE_FLAGS = {
  debug: [],
  profile: ['--profile'],
  release: ['--release'],
};

/**
 * Builds the argv for `flutter run --machine` from a launch config, per
 * docs/spec.md's launch-config schema (type/request/program/args/cwd/
 * flutterMode/platform/deviceId/vmServiceUri/stopOnEntry/useFvm).
 */
export function buildRunArgs(config = {}) {
  const args = ['run', '--machine'];

  if (config.program) {
    args.push('-t', config.program);
  }

  if (config.deviceId) {
    args.push('-d', config.deviceId);
  }

  args.push(...(MODE_FLAGS[config.flutterMode] || []));

  if (config.stopOnEntry) {
    args.push('--start-paused');
  }

  if (Array.isArray(config.args)) {
    args.push(...config.args);
  }

  return args;
}

export function buildAttachArgs(config = {}) {
  const args = ['attach', '--machine'];

  if (config.deviceId) {
    args.push('-d', config.deviceId);
  }

  if (config.vmServiceUri) {
    args.push('--debug-uri', config.vmServiceUri);
  }

  if (Array.isArray(config.args)) {
    args.push(...config.args);
  }

  return args;
}
