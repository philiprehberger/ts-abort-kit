/**
 * Options for creating a timeout-linked AbortSignal.
 */
export interface WithTimeoutOptions {
  /** Timeout in milliseconds. */
  ms: number;
  /** Optional existing signal to combine with the timeout. */
  signal?: AbortSignal;
  /** Optional reason passed when the timeout triggers. */
  reason?: unknown;
}

/**
 * Result returned by {@link withTimeout}.
 */
export interface WithTimeoutResult {
  /** The combined AbortSignal. */
  signal: AbortSignal;
  /** Call to clear the internal timeout and (if no external signal was provided) abort cleanup. */
  cleanup: () => void;
}

/**
 * Result returned by {@link linkedSignal}.
 */
export interface LinkedSignalResult {
  /** The child AbortController. */
  controller: AbortController;
  /** The child signal (shorthand for `controller.signal`). */
  signal: AbortSignal;
  /** Detach the child from the parent so it is no longer auto-aborted. */
  cleanup: () => void;
}
