'use babel';

describe('pulsar-flutter', () => {
  let mainModule;

  beforeEach(async () => {
    await atom.packages.activatePackage('pulsar-flutter');
    mainModule = atom.packages.getActivePackage('pulsar-flutter').mainModule;
  });

  afterEach(async () => {
    await atom.packages.deactivatePackage('pulsar-flutter');
  });

  it('activates without throwing', () => {
    expect(mainModule.manager).toBeTruthy();
    expect(mainModule.runner).toBeTruthy();
    expect(mainModule.daemon).toBeTruthy();
  });

  it('registers the Dart grammar for .dart files', async () => {
    const editor = await atom.workspace.open('fixtures/sample_app/lib/main.dart');
    expect(editor.getGrammar().scopeName).toBe('source.dart');
  });

  it('registers Flutter workspace commands', () => {
    const workspaceElement = atom.views.getView(atom.workspace);
    const registered = atom.commands.findCommands({ target: workspaceElement }).map((c) => c.name);

    for (const command of [
      'flutter:run',
      'flutter:hot-reload',
      'flutter:hot-restart',
      'flutter:stop',
      'flutter:select-device',
      'flutter:doctor',
      'flutter:create-project',
      'flutter:screenshot',
    ]) {
      expect(registered).toContain(command);
    }
  });

  it('registers Dart editor commands', async () => {
    const editor = await atom.workspace.open('fixtures/sample_app/lib/main.dart');
    const editorElement = atom.views.getView(editor);
    const registered = atom.commands.findCommands({ target: editorElement }).map((c) => c.name);

    expect(registered).toContain('dart:show-hover-info');
    expect(registered).toContain('dart:go-to-definition');
  });
});
