import type { CalendarMonthApiResponse } from '@/features/calendar/lib/types/calendar-holiday-api.types'

type CachedCalendarMonth = {
  expiresAt: number
  payload: CalendarMonthApiResponse
}

const FULL_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7
const PARTIAL_CACHE_TTL_MS = 1000 * 60

const monthCache = new Map<string, CachedCalendarMonth>()
const inFlightMonthRequests = new Map<string, Promise<CalendarMonthApiResponse>>()

export function getCalendarMonthCacheKey(params: { year: number; month: number }) {
  return `${params.year}-${String(params.month).padStart(2, '0')}`
}

export function getCachedCalendarMonth(key: string) {
  const cached = monthCache.get(key)
  if (!cached) return null

  if (cached.expiresAt <= Date.now()) {
    monthCache.delete(key)
    return null
  }

  return {
    ...cached.payload,
    meta: {
      ...cached.payload.meta,
      cached: true,
    },
  }
}

export function setCachedCalendarMonth(payload: CalendarMonthApiResponse) {
  const key = getCalendarMonthCacheKey(payload)
  const hasFailedSource = Object.values(payload.meta.sources).some(status => status === 'failed')
  const ttlMs = hasFailedSource ? PARTIAL_CACHE_TTL_MS : FULL_CACHE_TTL_MS

  monthCache.set(key, {
    expiresAt: Date.now() + ttlMs,
    payload: {
      ...payload,
      meta: {
        ...payload.meta,
        cached: false,
      },
    },
  })
}

export function getInFlightCalendarMonth(key: string) {
  return inFlightMonthRequests.get(key) ?? null
}

export function setInFlightCalendarMonth(
  key: string,
  request: Promise<CalendarMonthApiResponse>
) {
  inFlightMonthRequests.set(key, request)
}

export function clearInFlightCalendarMonth(key: string) {
  inFlightMonthRequests.delete(key)
}
