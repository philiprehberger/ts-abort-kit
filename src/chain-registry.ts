/**
 * Internal WeakMap registry tracking which AbortSignals were derived from which parents.
 * Populated by {@link linkedSignal}, {@link anySignal}, and the timeout helpers so that
 * {@link signalChain} can report meaningful chain depth without leaking memory.
 */
const PARENTS = new WeakMap<AbortSignal, readonly AbortSignal[]>();

export function registerChainParents(child: AbortSignal, parents: readonly AbortSignal[]): void {
  if (parents.length === 0) return;
  PARENTS.set(child, parents);
}

export function getChainParents(signal: AbortSignal): readonly AbortSignal[] | undefined {
  return PARENTS.get(signal);
}
