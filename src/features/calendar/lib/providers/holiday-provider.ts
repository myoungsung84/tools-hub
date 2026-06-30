import { apiGet } from '@/lib/client/api-client'

import type {
  CalendarMonthApiResponse,
  HolidayMap,
} from '../types/calendar-holiday-api.types'

export interface HolidayProvider {
  getMonth(params: { year: number; month: number; signal?: AbortSignal }): Promise<HolidayMap>
}

const monthCache = new Map<string, HolidayMap>()

function getCacheKey(params: { year: number; month: number }) {
  return `${params.year}-${String(params.month).padStart(2, '0')}`
}

export function hasCachedHolidayMap(params: { year: number; month: number }) {
  return monthCache.has(getCacheKey(params))
}

async function fetchHolidayMap(params: { year: number; month: number; signal?: AbortSignal }) {
  const cacheKey = getCacheKey(params)
  const cached = monthCache.get(cacheKey)
  if (cached) return cached

  const data = await apiGet<CalendarMonthApiResponse>({
    path: '/api/calendar/month',
    query: { year: params.year, month: params.month },
    signal: params.signal,
  })

  const holidays = data.holidays ?? {}
  monthCache.set(cacheKey, holidays)

  return holidays
}

export class CalendarMonthProvider implements HolidayProvider {
  getMonth(params: { year: number; month: number; signal?: AbortSignal }): Promise<HolidayMap> {
    return fetchHolidayMap({
      year: params.year,
      month: params.month,
      signal: params.signal,
    })
  }
}
