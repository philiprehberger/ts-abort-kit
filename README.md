# @philiprehberger/abort-kit

[![CI](https://github.com/philiprehberger/ts-abort-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/ts-abort-kit/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/abort-kit.svg)](https://www.npmjs.com/package/@philiprehberger/abort-kit)
[![Last updated](https://img.shields.io/github/last-commit/philiprehberger/ts-abort-kit)](https://github.com/philiprehberger/ts-abort-kit/commits/main)

AbortController utilities — timeout, race, linked signals

## Installation

```bash
npm install @philiprehberger/abort-kit
```

## Usage

```ts
import {
  withTimeout,
  withTimeoutCancellable,
  anySignal,
  linkedSignal,
  onAbort,
  signalChain,
  isAbortError,
  throwIfAborted,
} from '@philiprehberger/abort-kit';

// Abort after 5 seconds
const { signal, cleanup } = withTimeout({ ms: 5000 });
fetch('/api/data', { signal }).finally(cleanup);
```

### Cancellable Timeouts

`withTimeoutCancellable` exposes an explicit `cancel()` that clears the pending
timer without aborting the signal — ideal when callers consume the signal
quickly and want to release the timer deterministically.

```ts
import { withTimeoutCancellable } from '@philiprehberger/abort-kit';

const { signal, cancel } = withTimeoutCancellable({ ms: 5000 });
try {
  const response = await fetch('/api/data', { signal });
  // Request finished before the timeout — release the timer immediately.
  cancel();
  return response;
} catch (err) {
  cancel();
  throw err;
}
```

### Combining Signals

```ts
import { anySignal, linkedSignal } from '@philiprehberger/abort-kit';

// Combine multiple signals — abort when any fires
const a = new AbortController();
const b = new AbortController();
const combined = anySignal([a.signal, b.signal]);

// Create a child signal linked to a parent
const parent = new AbortController();
const child = linkedSignal(parent.signal);
parent.abort();
// child.signal is now aborted with the parent's reason
```

### Abort Listeners

```ts
import { onAbort } from '@philiprehberger/abort-kit';

const controller = new AbortController();
const removeListener = onAbort(controller.signal, (reason) => {
  console.log('Aborted:', reason);
});

// Later — remove the listener.
removeListener();
```

### Inspecting Abort Chains

`signalChain` reports a signal's chain depth and current abort state. Useful
for debugging deeply linked signals built up by middleware or HTTP clients.

```ts
import { anySignal, linkedSignal, signalChain } from '@philiprehberger/abort-kit';

const root = new AbortController();
const mid = linkedSignal(root.signal);
const leaf = linkedSignal(mid.signal);

signalChain(leaf.signal);
// => { depth: 2, isAborted: false, reason: undefined }

root.abort('shutdown');
signalChain(leaf.signal);
// => { depth: 2, isAborted: true, reason: 'shutdown' }
```

### Error Type Guards

```ts
import { isAbortError, throwIfAborted } from '@philiprehberger/abort-kit';

try {
  await fetch('/api/data', { signal });
} catch (err) {
  if (isAbortError(err)) {
    console.log('Request was aborted');
  }
}

// Bail out early if already aborted
throwIfAborted(signal);
```

## API

| Export | Description |
| --- | --- |
| `withTimeout(options)` | Create an AbortSignal that aborts after a timeout, optionally combined with an existing signal. Returns `{ signal, cleanup }`. |
| `withTimeoutCancellable(options)` | Like `withTimeout` but returns `{ signal, cancel }` where `cancel()` clears the pending timer without aborting the signal. |
| `anySignal(signals)` | Combine multiple AbortSignals into one that aborts when any input signal aborts. |
| `linkedSignal(parent)` | Create a child AbortController that auto-aborts when the parent signal aborts. Returns `{ controller, signal, cleanup }`. |
| `onAbort(signal, callback)` | Attach a callback that fires on abort (immediately if already aborted). Returns a cleanup function. |
| `signalChain(signal)` | Inspect a signal's chain — returns `{ depth, isAborted, reason }`. Depth reflects parents tracked by `linkedSignal`/`anySignal`/`withTimeout*`. |
| `isAbortError(error)` | Type guard — returns `true` if the error is a DOMException with name `"AbortError"`. |
| `throwIfAborted(signal)` | Throw the signal's reason if already aborted. |

## Development

```bash
npm install
npm run build
npm run typecheck
npm test
```

## Support

If you find this project useful:

⭐ [Star the repo](https://github.com/philiprehberger/ts-abort-kit)

🐛 [Report issues](https://github.com/philiprehberger/ts-abort-kit/issues?q=is%3Aissue+is%3Aopen+label%3Abug)

💡 [Suggest features](https://github.com/philiprehberger/ts-abort-kit/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)

❤️ [Sponsor development](https://github.com/sponsors/philiprehberger)

🌐 [All Open Source Projects](https://philiprehberger.com/open-source-packages)

💻 [GitHub Profile](https://github.com/philiprehberger)

🔗 [LinkedIn Profile](https://www.linkedin.com/in/philiprehberger)

## License

[MIT](LICENSE)
