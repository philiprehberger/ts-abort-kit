import { registerChainParents } from './chain-registry.js';
import type { LinkedSignalResult } from './types.js';

/**
 * Create a child AbortController that automatically aborts when the parent signal aborts.
 * The child can also be aborted independently.
 */
export function linkedSignal(parent: AbortSignal): LinkedSignalResult {
  const controller = new AbortController();
  registerChainParents(controller.signal, [parent]);

  if (parent.aborted) {
    controller.abort(parent.reason);
    return { controller, signal: controller.signal, cleanup: () => {} };
  }

  const onParentAbort = (): void => {
    controller.abort(parent.reason);
  };

  parent.addEventListener('abort', onParentAbort, { once: true });

  const cleanup = (): void => {
    parent.removeEventListener('abort', onParentAbort);
  };

  return { controller, signal: controller.signal, cleanup };
}
