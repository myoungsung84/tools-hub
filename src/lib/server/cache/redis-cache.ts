import { redis, redisKey } from './redis'

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  if (!redis) return null
  const v = await redis.get(redisKey(key))
  if (!v) return null
  try {
    return JSON.parse(v) as T
  } catch {
    return null
  }
}

export async function cacheSetJson<T>(key: string, value: T, ttlSec: number): Promise<void> {
  if (!redis) return
  await redis.set(redisKey(key), JSON.stringify(value), 'EX', ttlSec)
}
