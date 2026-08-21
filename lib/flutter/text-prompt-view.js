'use babel';

/** A single-line modal text input, used for `flutter create <name>`. */
module.exports = class TextPromptView {
  constructor({ prompt, placeholder = '' }) {
    this.element = document.createElement('div');
    this.element.classList.add('pulsar-flutter-prompt');

    const label = document.createElement('label');
    label.textContent = prompt;
    this.element.appendChild(label);

    this.miniEditor = document.createElement('atom-text-editor');
    this.miniEditor.setAttribute('mini', '');
    this.element.appendChild(this.miniEditor);
    this.miniEditor.getModel().setPlaceholderText(placeholder);

    this.panel = null;
    this.previouslyFocusedElement = null;
    this.resolvePromise = null;

    this.confirmDisposable = atom.commands.add(this.element, {
      'core:confirm': () => this._confirm(),
      'core:cancel': () => this._cancel(),
    });
  }

  prompt() {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.previouslyFocusedElement = document.activeElement;
      this.panel = atom.workspace.addModalPanel({ item: this.element });
      this.miniEditor.focus();
    });
  }

  _confirm() {
    const value = this.miniEditor.getModel().getText().trim();
    this._close();
    if (this.resolvePromise) this.resolvePromise(value || null);
  }

  _cancel() {
    this._close();
    if (this.resolvePromise) this.resolvePromise(null);
  }

  _close() {
    if (this.panel) this.panel.destroy();
    this.panel = null;
    if (this.previouslyFocusedElement) this.previouslyFocusedElement.focus();
    this.confirmDisposable.dispose();
  }
};
