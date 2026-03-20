# Changelog

All notable changes to this project will be documented in this file.

## 0.1.1

- Standardize package.json configuration

## [0.1.0] - 2026-03-20

### Added

- `withTimeout` — create an AbortSignal that aborts after a timeout
- `anySignal` — combine multiple AbortSignals (polyfill for AbortSignal.any)
- `linkedSignal` — child controller that auto-aborts with parent
- `onAbort` — safe abort listener with immediate callback if already aborted
- `isAbortError` — type guard for AbortError DOMException
- `throwIfAborted` — throw signal reason if already aborted
