import { registerChainParents } from './chain-registry.js';
import type {
  WithTimeoutOptions,
  WithTimeoutResult,
  WithTimeoutCancellableResult,
} from './types.js';

/**
 * Create an AbortSignal that automatically aborts after a timeout.
 * Optionally combines with an existing signal so either can trigger abort.
 */
export function withTimeout(options: WithTimeoutOptions): WithTimeoutResult {
  const { ms, signal, reason } = options;
  const controller = new AbortController();

  if (signal) {
    registerChainParents(controller.signal, [signal]);
  }

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

/**
 * Create an AbortSignal that aborts after a timeout, exposing an explicit `cancel()`
 * function that clears the pending timer without aborting the signal.
 *
 * Use this when callers consume the signal quickly and want to release the timer
 * deterministically (for example, after a fetch completes successfully) so the
 * pending `setTimeout` does not leak until the timeout fires.
 */
export function withTimeoutCancellable(
  options: WithTimeoutOptions,
): WithTimeoutCancellableResult {
  const { ms, signal: parent, reason } = options;
  const controller = new AbortController();

  if (parent) {
    registerChainParents(controller.signal, [parent]);
  }

  let cancelled = false;

  if (parent?.aborted) {
    controller.abort(parent.reason);
    cancelled = true;
    return { signal: controller.signal, cancel: () => {} };
  }

  const timeoutId = setTimeout(() => {
    if (cancelled) return;
    cancelled = true;
    if (parent) parent.removeEventListener('abort', onParentAbort);
    controller.abort(
      reason ?? new DOMException('The operation was aborted due to timeout', 'TimeoutError'),
    );
  }, ms);

  const onParentAbort = (): void => {
    if (cancelled) return;
    cancelled = true;
    clearTimeout(timeoutId);
    controller.abort(parent!.reason);
  };

  if (parent) {
    parent.addEventListener('abort', onParentAbort, { once: true });
  }

  const cancel = (): void => {
    if (cancelled) return;
    cancelled = true;
    clearTimeout(timeoutId);
    if (parent) parent.removeEventListener('abort', onParentAbort);
  };

  return { signal: controller.signal, cancel };
}
