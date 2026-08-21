'use babel';

import path from 'path';
import { CompositeDisposable } from 'atom';
import { resolveFlutterCommand } from '../flutter/sdk';
import { runProcessCapturingOutput } from '../flutter/run-to-completion';
import { buildDoctorArgs, buildCreateProjectArgs, buildScreenshotArgs } from '../flutter/tool-args';
import DeviceListView from '../flutter/device-list-view';
import TextPromptView from '../flutter/text-prompt-view';

/**
 * Runs a Flutter CLI subcommand to completion, dumps its combined
 * stdout/stderr into a new editor pane, and only then reports success or
 * failure — never before the process has actually finished.
 */
async function runToTextEditor(args, { cwd } = {}) {
  const { command, args: baseArgs } = resolveFlutterCommand();
  const { success, output } = await runProcessCapturingOutput(command, [...baseArgs, ...args], { cwd });

  const editor = await atom.workspace.open();
  editor.setText(output);
  editor.getBuffer().setPath('');

  return success;
}

function notifyResult(success, successDescription, failureDescription) {
  const notify = success ? atom.notifications.addSuccess : atom.notifications.addError;
  notify('Flutter', { description: success ? successDescription : failureDescription, dismissable: true });
}

/**
 * `deviceState.current` is shared with the run/hot-reload commands so a
 * device picked here becomes the target for `flutter:run`.
 */
export function registerFlutterToolCommands(daemon, deviceState) {
  const subscriptions = new CompositeDisposable();
  const deviceListView = new DeviceListView(daemon, (device) => {
    deviceState.set(device);
    atom.notifications.addInfo('Flutter', { description: `Selected device: ${device.name}` });
  });

  subscriptions.add(
    daemon.onDevicesChanged(() => deviceListView.selectListView.update({ items: daemon.getDeviceList() })),
  );

  subscriptions.add(atom.commands.add('atom-workspace', {
    'flutter:doctor': () => runToTextEditor(buildDoctorArgs(), { cwd: atom.project.getPaths()[0] }),

    'flutter:create-project': async () => {
      const prompt = new TextPromptView({
        prompt: 'Project name:',
        placeholder: 'my_app',
      });
      const name = await prompt.prompt();
      if (!name) return;

      const parent = atom.project.getPaths()[0] || process.cwd();
      const success = await runToTextEditor(buildCreateProjectArgs(name), { cwd: parent });
      notifyResult(
        success,
        `Project created at ${path.join(parent, name)}`,
        `Failed to create project "${name}" — see the output for details.`,
      );
    },

    'flutter:screenshot': async () => {
      const cwd = atom.project.getPaths()[0] || process.cwd();
      const outPath = path.join(cwd, `screenshot-${Date.now()}.png`);
      const args = buildScreenshotArgs({
        deviceId: deviceState.current && deviceState.current.id,
        outPath,
      });
      const success = await runToTextEditor(args, { cwd });
      notifyResult(
        success,
        `Screenshot saved to ${outPath}`,
        'Failed to capture screenshot — see the output for details.',
      );
    },

    'flutter:select-device': () => deviceListView.toggle(),
  }));

  subscriptions.add({ dispose: () => deviceListView.destroy() });

  return subscriptions;
}
