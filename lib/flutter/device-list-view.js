'use babel';

const SelectListView = require('atom-select-list');
const SingleFlight = require('./single-flight').default;

module.exports = class DeviceListView {
  constructor(daemon, onSelect) {
    this.daemon = daemon;
    this.onSelect = onSelect;
    this.panel = null;
    this.previouslyFocusedElement = null;
    this.opening = new SingleFlight();

    this.selectListView = new SelectListView({
      emptyMessage: 'No devices found. Is a device or emulator connected?',
      items: [],
      filterKeyForItem: (device) => `${device.name} ${device.platform}`,
      elementForItem: (device) => {
        const element = document.createElement('li');
        element.textContent = `${device.name} (${device.platform}${device.emulator ? ', emulator' : ''})`;
        element.dataset.deviceId = device.id;
        return element;
      },
      didConfirmSelection: (device) => {
        this.cancel();
        this.onSelect(device);
      },
      didCancelSelection: () => this.cancel(),
    });
  }

  cancel() {
    if (this.panel) this.panel.destroy();
    this.panel = null;
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
  }

  toggle() {
    if (this.panel) {
      this.cancel();
      return Promise.resolve();
    }

    return this.opening.run(async () => {
      await this.daemon.ensureStarted();
      await this.selectListView.update({ items: this.daemon.getDeviceList() });

      if (this.panel) return; // cancelled while awaiting above

      this.previouslyFocusedElement = document.activeElement;
      this.panel = atom.workspace.addModalPanel({ item: this.selectListView });
      this.selectListView.focus();
      this.selectListView.reset();
    });
  }

  destroy() {
    this.cancel();
    return this.selectListView.destroy();
  }
};
