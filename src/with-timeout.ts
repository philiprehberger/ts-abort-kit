import type { WithTimeoutOptions, WithTimeoutResult } from './types.js';

/**
 * Create an AbortSignal that automatically aborts after a timeout.
 * Optionally combines with an existing signal so either can trigger abort.
 */
export function withTimeout(options: WithTimeoutOptions): WithTimeoutResult {
  const { ms, signal, reason } = options;
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort(reason ?? new DOMException('The operation was aborted due to timeout', 'TimeoutError'));
  }, ms);

  let cleaned = false;

  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', onParentAbort);
    }
  };

  const onParentAbort = (): void => {
    controller.abort(signal!.reason);
    cleanup();
  };

  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      controller.abort(signal.reason);
      cleaned = true;
      return { signal: controller.signal, cleanup: () => {} };
    }
    signal.addEventListener('abort', onParentAbort, { once: true });
  }

  return { signal: controller.signal, cleanup };
}
