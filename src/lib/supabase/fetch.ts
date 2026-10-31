import "server-only";

/**
 * fetch with a deadline. Without one, a slow or unreachable database leaves the
 * request hanging until the platform kills it (a 504 after ~15s); with it we fail
 * fast and show a designed error state or fall back gracefully.
 */
export function fetchWithTimeout(ms: number): typeof fetch {
  return (input, init) => {
    const timeout = AbortSignal.timeout(ms);
    const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
    return fetch(input, { ...init, signal });
  };
}
