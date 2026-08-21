'use babel';

import { Emitter } from 'atom';
import FlutterProtocolClient from './protocol';
import { buildRunArgs, buildAttachArgs } from './run-args';
import { resolveFlutterCommand } from './sdk';

/**
 * Owns a single `flutter run --machine` (or `attach`) session: start,
 * hot reload, hot restart, stop. Talks Flutter's daemon protocol so we
 * get structured app.start/app.debugPort/app.started/app.stop events
 * instead of scraping terminal output.
 */
export default class FlutterRunner {
  constructor() {
    this.emitter = new Emitter();
    this.client = null;
    this.appId = null;
  }

  isRunning() {
    return this.client != null && this.client.isRunning();
  }

  onDidStart(handler) {
    return this.emitter.on('did-start', handler);
  }

  onDidStop(handler) {
    return this.emitter.on('did-stop', handler);
  }

  onLog(handler) {
    return this.emitter.on('log', handler);
  }

  start(config = {}, { attach = false } = {}) {
    if (this.isRunning()) {
      throw new Error('A Flutter run session is already active. Stop it first.');
    }

    const { command, args: baseArgs } = resolveFlutterCommand();
    const args = [...baseArgs, ...(attach ? buildAttachArgs(config) : buildRunArgs(config))];

    this.client = new FlutterProtocolClient(command, args, { cwd: config.cwd });

    this.client.onEvent('app.start', (params) => {
      this.appId = params.appId;
      this.emitter.emit('did-start', params);
    });
    this.client.onEvent('app.debugPort', (params) => this.emitter.emit('log', `Debug service: ${params.wsUri || params.uri}`));
    this.client.onEvent('app.log', (params) => this.emitter.emit('log', params.log));
    this.client.onEvent('app.stop', () => {
      this.appId = null;
      this.emitter.emit('did-stop', {});
    });
    this.client.onStderr((text) => this.emitter.emit('log', text));
    this.client.onExit(() => {
      this.appId = null;
      this.emitter.emit('did-stop', {});
    });

    this.client.start();
  }

  async hotReload() {
    if (!this.appId) throw new Error('No running Flutter app to reload.');
    return this.client.request('app.restart', { appId: this.appId, fullRestart: false });
  }

  async hotRestart() {
    if (!this.appId) throw new Error('No running Flutter app to restart.');
    return this.client.request('app.restart', { appId: this.appId, fullRestart: true });
  }

  async stop() {
    if (!this.client) return;
    if (this.appId) {
      try {
        await this.client.request('app.stop', { appId: this.appId });
      } catch (error) {
        // fall through to hard-kill below
      }
    }
    this.client.stop();
    this.client = null;
    this.appId = null;
  }

  dispose() {
    if (this.client) {
      this.client.stop();
      this.client = null;
    }
    this.emitter.dispose();
  }
}
