/**
 * Attach a callback to an AbortSignal safely.
 * If the signal is already aborted, the callback fires immediately.
 * Returns a cleanup function to remove the listener.
 */
export function onAbort(signal: AbortSignal, callback: (reason: unknown) => void): () => void {
  if (signal.aborted) {
    callback(signal.reason);
    return () => {};
  }

  const handler = (): void => {
    callback(signal.reason);
  };

  signal.addEventListener('abort', handler, { once: true });

  return () => {
    signal.removeEventListener('abort', handler);
  };
}
