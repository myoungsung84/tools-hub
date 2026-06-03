import { apiGet } from '@/lib/client/api-client'

import type {
  CalendarHolidaysApiResponse,
  HolidayMap,
} from '../types/calendar-holiday-api.types'

export interface HolidayProvider {
  getMonth(params: { year: number; month: number; signal?: AbortSignal }): Promise<HolidayMap>
}

const monthCache = new Map<string, HolidayMap>()

function getCacheKey(params: {
  path: '/api/calendar/holidays' | '/api/calendar/anniversaries' | '/api/calendar/sundry'
  year: number
  month: number
}) {
  return `${params.path}:${params.year}-${String(params.month).padStart(2, '0')}`
}

export function hasCachedHolidayMap(params: {
  path: '/api/calendar/holidays' | '/api/calendar/anniversaries' | '/api/calendar/sundry'
  year: number
  month: number
}) {
  return monthCache.has(getCacheKey(params))
}

async function fetchHolidayMap(params: {
  path: '/api/calendar/holidays' | '/api/calendar/anniversaries' | '/api/calendar/sundry'
  year: number
  month: number
  signal?: AbortSignal
}): Promise<HolidayMap> {
  const cacheKey = getCacheKey(params)
  const cached = monthCache.get(cacheKey)
  if (cached) return cached

  const data = await apiGet<CalendarHolidaysApiResponse>({
    path: params.path,
    query: { year: params.year, month: params.month },
    signal: params.signal,
  })

  const holidays = data.holidays ?? {}
  monthCache.set(cacheKey, holidays)

  return holidays
}

export class ExternalPublicHolidayProvider implements HolidayProvider {
  getMonth(params: { year: number; month: number; signal?: AbortSignal }): Promise<HolidayMap> {
    return fetchHolidayMap({
      path: '/api/calendar/holidays',
      year: params.year,
      month: params.month,
      signal: params.signal,
    })
  }
}

export class ExternalAnniversaryProvider implements HolidayProvider {
  getMonth(params: { year: number; month: number; signal?: AbortSignal }): Promise<HolidayMap> {
    return fetchHolidayMap({
      path: '/api/calendar/anniversaries',
      year: params.year,
      month: params.month,
      signal: params.signal,
    })
  }
}

export class ExternalSundryProvider implements HolidayProvider {
  getMonth(params: { year: number; month: number; signal?: AbortSignal }): Promise<HolidayMap> {
    return fetchHolidayMap({
      path: '/api/calendar/sundry',
      year: params.year,
      month: params.month,
      signal: params.signal,
    })
  }
}

export class CompositeHolidayProvider implements HolidayProvider {
  constructor(private readonly providers: HolidayProvider[]) {}

  async getMonth(params: { year: number; month: number; signal?: AbortSignal }): Promise<HolidayMap> {
    const settled = await Promise.allSettled(this.providers.map(provider => provider.getMonth(params)))
    const maps = settled.flatMap(result => (result.status === 'fulfilled' ? [result.value] : []))
    const merged: HolidayMap = {}

    for (const holidayMap of maps) {
      for (const [date, items] of Object.entries(holidayMap)) {
        const out = (merged[date] ??= [])

        for (const item of items) {
          const exists = out.some(
            current =>
              current.date === item.date &&
              current.name === item.name &&
              current.kind === item.kind &&
              current.source === item.source
          )
          if (!exists) out.push(item)
        }
      }
    }

    return merged
  }
}
