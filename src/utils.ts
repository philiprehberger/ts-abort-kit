/**
 * Type guard that checks whether an error is an `AbortError` (DOMException with name `"AbortError"`).
 */
export function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'AbortError';
}

/**
 * Throw the signal's abort reason if the signal is already aborted.
 * Useful at the start of an async function to bail out early.
 */
export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw signal.reason;
  }
}
