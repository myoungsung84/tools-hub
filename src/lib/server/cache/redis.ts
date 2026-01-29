import Redis from 'ioredis'

function getRedisUrl() {
  const url = process.env.REDIS_URL
  if (!url) return null
  return url
}

const redisUrl = getRedisUrl()

export const redis =
  redisUrl != null
    ? new Redis(redisUrl, {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        lazyConnect: true,
      })
    : null

export function redisKey(key: string) {
  const prefix = process.env.REDIS_PREFIX ?? 'tools-hub'
  return `${prefix}:${key}`
}
