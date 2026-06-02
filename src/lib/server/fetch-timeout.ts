const DEFAULT_TIMEOUT_MS = 8000

function composeAbortSignal(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', () => controller.abort(), { once: true })
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const { signal, cleanup } = composeAbortSignal(init.signal ?? undefined, timeoutMs)

  try {
    return await fetch(input, { ...init, signal })
  } finally {
    cleanup()
  }
}
