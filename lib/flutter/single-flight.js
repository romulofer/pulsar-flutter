'use babel';

/**
 * Collapses concurrent calls into the single in-flight run: a second call
 * made while the first hasn't settled yet returns that same promise
 * instead of starting a duplicate run (see DeviceListView#toggle, which
 * used to open two modal panels on a fast double-click).
 */
export default class SingleFlight {
  constructor() {
    this.inFlight = null;
  }

  run(fn) {
    if (this.inFlight) return this.inFlight;
    this.inFlight = Promise.resolve()
      .then(fn)
      .finally(() => { this.inFlight = null; });
    return this.inFlight;
  }
}
