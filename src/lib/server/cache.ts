export type CacheEntry<T> = {
  value: T
  expiresAt: number
}

/**
 * 간단한 in-memory TTL 캐시
 * - 프로세스 단위
 * - 서버 재시작 시 초기화
 */
export function createTtlCache<T>(ttlMs: number) {
  const store = new Map<string, CacheEntry<T>>()

  function get(key: string): T | undefined {
    const hit = store.get(key)
    if (!hit) return undefined

    if (Date.now() > hit.expiresAt) {
      store.delete(key)
      return undefined
    }

    return hit.value
  }

  function set(key: string, value: T) {
    store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }

  function clear(key?: string) {
    if (key) store.delete(key)
    else store.clear()
  }

  return { get, set, clear }
}
