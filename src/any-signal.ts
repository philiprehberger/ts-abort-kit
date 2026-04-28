import { registerChainParents } from './chain-registry.js';

/**
 * Combine multiple AbortSignals into one that aborts when *any* input signal aborts.
 * Acts as a polyfill for `AbortSignal.any()`.
 */
export function anySignal(signals: AbortSignal[]): AbortSignal {
  if (signals.length === 0) {
    return new AbortController().signal;
  }

  if (signals.length === 1) {
    return signals[0];
  }

  const controller = new AbortController();
  registerChainParents(controller.signal, signals.slice());

  const onAbort = (signal: AbortSignal): void => {
    controller.abort(signal.reason);
    for (const s of signals) {
      s.removeEventListener('abort', handler);
    }
  };

  function handler(this: AbortSignal): void {
    onAbort(this);
  }

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', handler, { once: true });
  }

  return controller.signal;
}
