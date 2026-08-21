'use babel';

import { spawn } from 'child_process';
import { EventEmitter } from 'events';

const CONTENT_LENGTH_RE = /^Content-Length:\s*(\d+)\s*$/i;

/**
 * Thin wrapper around Node's EventEmitter that hands out Atom-style
 * Disposables from `.on`, so callers can `subscriptions.add(...)` them
 * without pulling the `atom` module into this otherwise Atom-independent
 * transport layer (kept plain-Node so it stays unit-testable).
 */
class Emitter {
  constructor() {
    this.emitter = new EventEmitter();
  }

  emit(event, ...args) {
    this.emitter.emit(event, ...args);
  }

  on(event, handler) {
    this.emitter.on(event, handler);
    return { dispose: () => this.emitter.removeListener(event, handler) };
  }
}

/**
 * Minimal JSON-RPC 2.0 client over stdio, framed per LSP's
 * Content-Length header convention. No external LSP library dependency.
 */
export default class LspClient {
  constructor(command, args, options = {}) {
    this.command = command;
    this.args = args;
    this.options = options;
    this.emitter = new Emitter();
    this.process = null;
    this.buffer = Buffer.alloc(0);
    this.expectedLength = null;
    this.nextId = 1;
    this.pending = new Map();
  }

  start() {
    if (this.process) return;
    this.process = spawn(this.command, this.args, {
      cwd: this.options.cwd,
      env: this.options.env || process.env,
    });

    this.process.stdout.on('data', (chunk) => this._onData(chunk));
    this.process.stderr.on('data', (chunk) => {
      this.emitter.emit('stderr', chunk.toString('utf8'));
    });
    this.process.on('exit', (code, signal) => {
      this.emitter.emit('exit', { code, signal });
      this._rejectAllPending(new Error('Language server process exited'));
      this.process = null;
    });
    this.process.on('error', (error) => {
      this.emitter.emit('error', error);
      this._rejectAllPending(error);
    });
  }

  stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  isRunning() {
    return this.process != null;
  }

  request(method, params) {
    const id = this.nextId++;
    const payload = { jsonrpc: '2.0', id, method, params };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this._write(payload);
    });
  }

  notify(method, params) {
    this._write({ jsonrpc: '2.0', method, params });
  }

  onNotification(method, handler) {
    return this.emitter.on(`notification:${method}`, handler);
  }

  onRequest(method, handler) {
    return this.emitter.on(`request:${method}`, handler);
  }

  onError(handler) {
    return this.emitter.on('error', handler);
  }

  onExit(handler) {
    return this.emitter.on('exit', handler);
  }

  _write(payload) {
    if (!this.process) return;
    const json = JSON.stringify(payload);
    const header = `Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n`;
    this.process.stdin.write(header + json, 'utf8');
  }

  _onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.expectedLength == null) {
        const headerEnd = this.buffer.indexOf('\r\n\r\n');
        if (headerEnd === -1) return;

        const header = this.buffer.slice(0, headerEnd).toString('utf8');
        const match = header.split('\r\n').map((line) => line.match(CONTENT_LENGTH_RE)).find(Boolean);
        if (!match) {
          this.buffer = this.buffer.slice(headerEnd + 4);
          continue;
        }
        this.expectedLength = parseInt(match[1], 10);
        this.buffer = this.buffer.slice(headerEnd + 4);
      }

      if (this.buffer.length < this.expectedLength) return;

      const body = this.buffer.slice(0, this.expectedLength).toString('utf8');
      this.buffer = this.buffer.slice(this.expectedLength);
      this.expectedLength = null;

      this._handleMessage(body);
    }
  }

  _handleMessage(body) {
    let message;
    try {
      message = JSON.parse(body);
    } catch (error) {
      this.emitter.emit('error', error);
      return;
    }

    if (message.id != null && (message.result !== undefined || message.error !== undefined)) {
      const pending = this.pending.get(message.id);
      if (pending) {
        this.pending.delete(message.id);
        if (message.error) {
          pending.reject(new Error(message.error.message || 'LSP request failed'));
        } else {
          pending.resolve(message.result);
        }
      }
      return;
    }

    if (message.method && message.id != null) {
      this.emitter.emit(`request:${message.method}`, message.params, (result) => {
        this._write({ jsonrpc: '2.0', id: message.id, result });
      });
      return;
    }

    if (message.method) {
      this.emitter.emit(`notification:${message.method}`, message.params);
    }
  }

  _rejectAllPending(error) {
    for (const { reject } of this.pending.values()) {
      reject(error);
    }
    this.pending.clear();
  }
}
