import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  withTimeout,
  anySignal,
  linkedSignal,
  onAbort,
  isAbortError,
  throwIfAborted,
} from '../dist/index.js';

describe('withTimeout', () => {
  it('should return an AbortSignal', () => {
    const { signal, cleanup } = withTimeout({ ms: 1000 });
    assert.ok(signal instanceof AbortSignal);
    assert.strictEqual(signal.aborted, false);
    cleanup();
  });

  it('should abort after the specified timeout', async () => {
    const { signal, cleanup } = withTimeout({ ms: 50 });
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.strictEqual(signal.aborted, true);
    cleanup();
  });

  it('should accept a custom reason', async () => {
    const reason = new Error('custom timeout');
    const { signal, cleanup } = withTimeout({ ms: 50, reason });
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.strictEqual(signal.reason, reason);
    cleanup();
  });

  it('should abort when parent signal aborts', () => {
    const parent = new AbortController();
    const { signal, cleanup } = withTimeout({ ms: 5000, signal: parent.signal });
    const reason = new Error('parent aborted');
    parent.abort(reason);
    assert.strictEqual(signal.aborted, true);
    assert.strictEqual(signal.reason, reason);
    cleanup();
  });

  it('should handle already-aborted parent signal', () => {
    const parent = new AbortController();
    parent.abort('already done');
    const { signal } = withTimeout({ ms: 5000, signal: parent.signal });
    assert.strictEqual(signal.aborted, true);
    assert.strictEqual(signal.reason, 'already done');
  });
});

describe('anySignal', () => {
  it('should return a signal that is not aborted when given non-aborted signals', () => {
    const a = new AbortController();
    const b = new AbortController();
    const combined = anySignal([a.signal, b.signal]);
    assert.strictEqual(combined.aborted, false);
  });

  it('should abort when any input signal aborts', () => {
    const a = new AbortController();
    const b = new AbortController();
    const combined = anySignal([a.signal, b.signal]);
    const reason = new Error('a aborted');
    a.abort(reason);
    assert.strictEqual(combined.aborted, true);
    assert.strictEqual(combined.reason, reason);
  });

  it('should return an already-aborted signal if any input is already aborted', () => {
    const a = new AbortController();
    a.abort('pre-aborted');
    const b = new AbortController();
    const combined = anySignal([a.signal, b.signal]);
    assert.strictEqual(combined.aborted, true);
    assert.strictEqual(combined.reason, 'pre-aborted');
  });

  it('should return a non-aborted signal for empty array', () => {
    const combined = anySignal([]);
    assert.strictEqual(combined.aborted, false);
  });

  it('should return the same signal for single-element array', () => {
    const a = new AbortController();
    const combined = anySignal([a.signal]);
    assert.strictEqual(combined, a.signal);
  });
});

describe('linkedSignal', () => {
  it('should create a child that aborts when parent aborts', () => {
    const parent = new AbortController();
    const { signal, cleanup } = linkedSignal(parent.signal);
    assert.strictEqual(signal.aborted, false);
    parent.abort('parent reason');
    assert.strictEqual(signal.aborted, true);
    assert.strictEqual(signal.reason, 'parent reason');
    cleanup();
  });

  it('should allow independent child abort', () => {
    const parent = new AbortController();
    const { controller, signal, cleanup } = linkedSignal(parent.signal);
    controller.abort('child reason');
    assert.strictEqual(signal.aborted, true);
    assert.strictEqual(signal.reason, 'child reason');
    assert.strictEqual(parent.signal.aborted, false);
    cleanup();
  });

  it('should handle already-aborted parent', () => {
    const parent = new AbortController();
    parent.abort('already');
    const { signal } = linkedSignal(parent.signal);
    assert.strictEqual(signal.aborted, true);
    assert.strictEqual(signal.reason, 'already');
  });

  it('should detach child from parent on cleanup', () => {
    const parent = new AbortController();
    const { signal, cleanup } = linkedSignal(parent.signal);
    cleanup();
    parent.abort('late');
    assert.strictEqual(signal.aborted, false);
  });
});

describe('onAbort', () => {
  it('should call callback when signal aborts', () => {
    const controller = new AbortController();
    let calledWith: unknown = undefined;
    onAbort(controller.signal, (reason) => {
      calledWith = reason;
    });
    controller.abort('test reason');
    assert.strictEqual(calledWith, 'test reason');
  });

  it('should call callback immediately if already aborted', () => {
    const controller = new AbortController();
    controller.abort('already');
    let calledWith: unknown = undefined;
    onAbort(controller.signal, (reason) => {
      calledWith = reason;
    });
    assert.strictEqual(calledWith, 'already');
  });

  it('should return a cleanup function that prevents callback', () => {
    const controller = new AbortController();
    let called = false;
    const cleanup = onAbort(controller.signal, () => {
      called = true;
    });
    cleanup();
    controller.abort();
    assert.strictEqual(called, false);
  });
});

describe('isAbortError', () => {
  it('should return true for AbortError DOMException', () => {
    const err = new DOMException('aborted', 'AbortError');
    assert.strictEqual(isAbortError(err), true);
  });

  it('should return false for other DOMExceptions', () => {
    const err = new DOMException('timeout', 'TimeoutError');
    assert.strictEqual(isAbortError(err), false);
  });

  it('should return false for regular errors', () => {
    assert.strictEqual(isAbortError(new Error('nope')), false);
  });

  it('should return false for non-error values', () => {
    assert.strictEqual(isAbortError(null), false);
    assert.strictEqual(isAbortError('string'), false);
    assert.strictEqual(isAbortError(42), false);
  });
});

describe('throwIfAborted', () => {
  it('should not throw if signal is not aborted', () => {
    const controller = new AbortController();
    assert.doesNotThrow(() => throwIfAborted(controller.signal));
  });

  it('should throw the signal reason if aborted', () => {
    const controller = new AbortController();
    const reason = new Error('aborted');
    controller.abort(reason);
    assert.throws(() => throwIfAborted(controller.signal), (err) => err === reason);
  });
});
