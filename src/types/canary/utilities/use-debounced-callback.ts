import { useEffect, useMemo, useRef } from 'react';

export interface DebouncedCallback<Args extends readonly unknown[]> {
  (...args: Args): void;
  /** Cancel the pending invocation, if any. */
  cancel: () => void;
}

/**
 * Returns a stable debounced wrapper around `fn`: calls reset the timer, and
 * `fn` runs `delayMs` after the last call, with the last call's arguments.
 *
 * `fn` may return anything (`R`); the value is knowingly discarded, since a
 * debounced call fires later and cannot hand a result back to the caller —
 * which is why the wrapper is typed `(...args: Args) => void` rather than
 * preserving `R`.
 *
 * The wrapper's identity never changes, but it always invokes the latest
 * `fn` and `delayMs` from the most recent render — callers can pass a plain
 * inline function without memoizing it. Any pending invocation is cancelled
 * automatically on unmount.
 */
export function useDebouncedCallback<Args extends readonly unknown[], R>(
  fn: (...args: Args) => R,
  delayMs: number,
): DebouncedCallback<Args> {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const delayRef = useRef(delayMs);
  delayRef.current = delayMs;
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const debounced = useMemo<DebouncedCallback<Args>>(() => {
    const invoke = (...args: Args) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void fnRef.current(...args); // result intentionally discarded
      }, delayRef.current);
    };
    return Object.assign(invoke, {
      cancel: () => clearTimeout(timerRef.current),
    });
  }, []);

  useEffect(() => () => debounced.cancel(), [debounced]);

  return debounced;
}
