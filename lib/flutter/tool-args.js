'use babel';

export function buildDoctorArgs() {
  return ['doctor'];
}

export function buildCreateProjectArgs(projectName) {
  return ['create', projectName];
}

export function buildScreenshotArgs({ deviceId, outPath } = {}) {
  const args = ['screenshot'];
  if (deviceId) args.push('-d', deviceId);
  if (outPath) args.push('--out', outPath);
  return args;
}
