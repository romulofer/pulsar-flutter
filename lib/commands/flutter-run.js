'use babel';

import { CompositeDisposable } from 'atom';

function projectRootFor(editor) {
  const filePath = editor && editor.getPath();
  if (filePath) {
    const [root] = atom.project.relativizePath(filePath);
    if (root) return root;
  }
  return atom.project.getPaths()[0];
}

function notifyError(error) {
  atom.notifications.addError('Flutter', { description: error.message, dismissable: true });
}

export function registerFlutterRunCommands(runner, deviceState) {
  const subscriptions = new CompositeDisposable();

  subscriptions.add(
    runner.onLog((text) => {
      if (text && text.trim()) console.log(`[flutter] ${text.trim()}`);
    }),
  );
  subscriptions.add(
    runner.onDidStart(() => atom.notifications.addSuccess('Flutter', { description: 'App started.' })),
  );
  subscriptions.add(
    runner.onDidStop(() => atom.notifications.addInfo('Flutter', { description: 'App stopped.' })),
  );

  const run = (flutterMode) => {
    try {
      const editor = atom.workspace.getActiveTextEditor();
      runner.start({
        cwd: projectRootFor(editor),
        flutterMode,
        deviceId: deviceState.current && deviceState.current.id,
      });
    } catch (error) {
      notifyError(error);
    }
  };

  subscriptions.add(atom.commands.add('atom-workspace', {
    'flutter:run': () => run('debug'),
    'flutter:run-release': () => run('release'),
    'flutter:run-profile': () => run('profile'),
    'flutter:debug': () => run('debug'),
    'flutter:hot-reload': () => runner.hotReload().catch(notifyError),
    'flutter:hot-restart': () => runner.hotRestart().catch(notifyError),
    'flutter:stop': () => runner.stop().catch(notifyError),
  }));

  return subscriptions;
}
