# @philiprehberger/abort-kit

[![CI](https://github.com/philiprehberger/ts-abort-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/ts-abort-kit/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@philiprehberger/abort-kit)](https://www.npmjs.com/package/@philiprehberger/abort-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AbortController utilities — timeout, race, linked signals

## Installation

```bash
npm install @philiprehberger/abort-kit
```

## Usage

```ts
import {
  withTimeout,
  anySignal,
  linkedSignal,
  onAbort,
  isAbortError,
  throwIfAborted,
} from '@philiprehberger/abort-kit';

// Abort after 5 seconds
const { signal, cleanup } = withTimeout({ ms: 5000 });
fetch('/api/data', { signal }).finally(cleanup);

// Combine multiple signals — abort when any fires
const controller = new AbortController();
const combined = anySignal([signal, controller.signal]);

// Create a child signal linked to a parent
const parent = new AbortController();
const child = linkedSignal(parent.signal);
// child.signal aborts automatically when parent aborts
parent.abort();

// Safe abort listener (fires immediately if already aborted)
const removeListener = onAbort(signal, (reason) => {
  console.log('Aborted:', reason);
});

// Type guard for AbortError
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
| `anySignal(signals)` | Combine multiple AbortSignals into one that aborts when any input signal aborts. |
| `linkedSignal(parent)` | Create a child AbortController that auto-aborts when the parent signal aborts. Returns `{ controller, signal, cleanup }`. |
| `onAbort(signal, callback)` | Attach a callback that fires on abort (immediately if already aborted). Returns a cleanup function. |
| `isAbortError(error)` | Type guard — returns `true` if the error is a DOMException with name `"AbortError"`. |
| `throwIfAborted(signal)` | Throw the signal's reason if already aborted. |

## Development

```bash
npm install
npm run build
npm run typecheck
npm test
```

## License

MIT
