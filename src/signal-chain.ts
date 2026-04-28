import { getChainParents } from './chain-registry.js';
import type { SignalChainInfo } from './types.js';

/**
 * Inspect an AbortSignal's chain for debugging.
 *
 * Returns the chain `depth` (how many ancestor links the signal has), along with the
 * current `isAborted` state and abort `reason`. Depth is meaningful only for chains
 * created via {@link linkedSignal}, {@link anySignal}, {@link withTimeout}, or
 * {@link withTimeoutCancellable}; plain `AbortController` signals report `depth: 0`.
 *
 * Internally the parent links are tracked via a `WeakMap`, so calling `signalChain`
 * does not prevent garbage collection of any signal in the chain.
 */
export function signalChain(signal: AbortSignal): SignalChainInfo {
  const visited = new Set<AbortSignal>();

  const walk = (s: AbortSignal): number => {
    if (visited.has(s)) return 0;
    visited.add(s);
    const parents = getChainParents(s);
    if (!parents || parents.length === 0) return 0;
    let max = 0;
    for (const p of parents) {
      const d = 1 + walk(p);
      if (d > max) max = d;
    }
    return max;
  };

  return {
    depth: walk(signal),
    isAborted: signal.aborted,
    reason: signal.aborted ? signal.reason : undefined,
  };
}
