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
 * Result returned by {@link withTimeoutCancellable}.
 */
export interface WithTimeoutCancellableResult {
  /** The combined AbortSignal. */
  signal: AbortSignal;
  /**
   * Cancel the pending timeout without aborting the signal. Safe to call multiple times.
   * Once cancelled, the timer cannot fire and any parent-signal listeners are removed.
   */
  cancel: () => void;
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

/**
 * Information returned by {@link signalChain} describing an abort chain.
 */
export interface SignalChainInfo {
  /**
   * Number of parent links the signal has. `0` for plain controllers, `1` for signals
   * created by {@link linkedSignal}/{@link anySignal} from leaf signals, and so on.
   */
  depth: number;
  /** Whether the signal is currently aborted. */
  isAborted: boolean;
  /** The abort reason if aborted, otherwise `undefined`. */
  reason: unknown;
}
