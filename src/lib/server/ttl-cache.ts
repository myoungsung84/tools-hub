type CacheEntry<T> = {
  value: T
  expiresAt: number
}

// Vercel serverless 인스턴스 단위 best-effort 캐시
const store = new Map<string, CacheEntry<unknown>>()

export function ttlGet<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return undefined
  }
  return entry.value
}

export function ttlSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}
