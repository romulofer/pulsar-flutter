'use babel';

import { spawn } from 'child_process';

/**
 * Spawns a one-off process and resolves only once it has actually
 * finished — never before, so callers can't report success/failure until
 * the process really produced that result (see docs/plan.md Etapa 4:
 * `flutter:doctor`/`create-project`/`screenshot` used to notify success
 * synchronously, before the process had even run).
 */
export function runProcessCapturingOutput(command, args, { cwd } = {}) {
  return new Promise((resolve) => {
    let output = '';
    const child = spawn(command, args, { cwd });

    child.stdout.on('data', (chunk) => { output += chunk.toString('utf8'); });
    child.stderr.on('data', (chunk) => { output += chunk.toString('utf8'); });

    child.on('close', (code) => resolve({ success: code === 0, output }));
    child.on('error', (error) => resolve({ success: false, output: `${output}\n${error.message}` }));
  });
}
