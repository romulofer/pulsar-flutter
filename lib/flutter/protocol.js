'use babel';

import { spawn } from 'child_process';
import { EventEmitter } from 'events';

/**
 * Client for Flutter's daemon JSON-RPC protocol, spoken both by
 * `flutter daemon` and `flutter run --machine`: each message is a single
 * line, a JSON array wrapping one object (request/response or event).
 * https://github.com/flutter/flutter/blob/master/packages/flutter_tools/doc/daemon.md
 */
export default class FlutterProtocolClient {
  constructor(command, args, options = {}) {
    this.command = command;
    this.args = args;
    this.options = options;
    this.emitter = new EventEmitter();
    this.process = null;
    this.buffer = '';
    this.nextId = 1;
    this.pending = new Map();
  }

  start() {
    if (this.process) return;
    this.process = spawn(this.command, this.args, {
      cwd: this.options.cwd,
      env: this.options.env || process.env,
    });

    this.process.stdout.on('data', (chunk) => this._onChunk(chunk.toString('utf8')));
    this.process.stderr.on('data', (chunk) => this.emitter.emit('stderr', chunk.toString('utf8')));
    this.process.on('exit', (code, signal) => {
      this.emitter.emit('exit', { code, signal });
      this._rejectAllPending(new Error('Flutter process exited'));
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

  /** Sends raw text to the process's stdin (e.g. Flutter's `r`/`R`/`q` hotkeys). */
  writeRaw(text) {
    if (this.process) this.process.stdin.write(text);
  }

  request(method, params) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this._writeFrame({ id, method, params });
    });
  }

  onEvent(event, handler) {
    this.emitter.on(`event:${event}`, handler);
    return { dispose: () => this.emitter.removeListener(`event:${event}`, handler) };
  }

  onStderr(handler) {
    this.emitter.on('stderr', handler);
    return { dispose: () => this.emitter.removeListener('stderr', handler) };
  }

  onExit(handler) {
    this.emitter.on('exit', handler);
    return { dispose: () => this.emitter.removeListener('exit', handler) };
  }

  _writeFrame(message) {
    if (!this.process) return;
    this.process.stdin.write(`[${JSON.stringify(message)}]\n`);
  }

  _onChunk(chunk) {
    this.buffer += chunk;
    let newlineIndex;
    // eslint-disable-next-line no-cond-assign
    while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, newlineIndex).trim();
      this.buffer = this.buffer.slice(newlineIndex + 1);
      if (line.length > 0) this._onLine(line);
    }
  }

  _onLine(line) {
    if (!line.startsWith('[') || !line.endsWith(']')) return;

    let messages;
    try {
      messages = JSON.parse(line);
    } catch (error) {
      return;
    }

    for (const message of messages) {
      if (message.id != null) {
        const pending = this.pending.get(message.id);
        if (pending) {
          this.pending.delete(message.id);
          if (message.error) {
            pending.reject(new Error(message.error.message || String(message.error)));
          } else {
            pending.resolve(message.result);
          }
        }
      } else if (message.event) {
        this.emitter.emit(`event:${message.event}`, message.params);
      }
    }
  }

  _rejectAllPending(error) {
    for (const { reject } of this.pending.values()) {
      reject(error);
    }
    this.pending.clear();
  }
}
