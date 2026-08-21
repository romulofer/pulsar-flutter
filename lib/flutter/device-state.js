'use babel';

/** Tiny shared store for the currently selected Flutter device. */
export default class DeviceState {
  constructor() {
    this.current = null;
    this.listeners = [];
  }

  set(device) {
    this.current = device;
    for (const listener of this.listeners) listener(device);
  }

  onChange(listener) {
    this.listeners.push(listener);
    return { dispose: () => { this.listeners = this.listeners.filter((l) => l !== listener); } };
  }
}
