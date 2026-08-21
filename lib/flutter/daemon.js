'use babel';

import { Emitter } from 'atom';
import FlutterProtocolClient from './protocol';
import { resolveFlutterCommand } from './sdk';

/**
 * Owns a long-lived `flutter daemon` process and the device list it
 * streams via `device.added` / `device.removed` / `device.changed`.
 */
export default class FlutterDaemon {
  constructor() {
    this.emitter = new Emitter();
    this.client = null;
    this.devices = new Map();
  }

  isRunning() {
    return this.client != null && this.client.isRunning();
  }

  onDevicesChanged(handler) {
    return this.emitter.on('devices-changed', handler);
  }

  getDeviceList() {
    return Array.from(this.devices.values());
  }

  async ensureStarted() {
    if (this.isRunning()) return;

    const { command, args } = resolveFlutterCommand();
    this.client = new FlutterProtocolClient(command, [...args, 'daemon'], {
      cwd: atom.project.getPaths()[0],
    });

    this.client.onEvent('device.added', (device) => {
      this.devices.set(device.id, device);
      this.emitter.emit('devices-changed', this.getDeviceList());
    });
    this.client.onEvent('device.removed', (device) => {
      this.devices.delete(device.id);
      this.emitter.emit('devices-changed', this.getDeviceList());
    });
    this.client.onEvent('device.changed', (device) => {
      this.devices.set(device.id, device);
      this.emitter.emit('devices-changed', this.getDeviceList());
    });
    this.client.onExit(() => {
      this.devices.clear();
      this.emitter.emit('devices-changed', this.getDeviceList());
      this.client = null;
    });

    this.client.start();
    await this.client.request('device.enable', {});
  }

  stop() {
    if (this.client) {
      this.client.stop();
      this.client = null;
    }
    this.devices.clear();
  }

  dispose() {
    this.stop();
    this.emitter.dispose();
  }
}
