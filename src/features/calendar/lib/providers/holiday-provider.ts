import { apiGet } from '@/lib/client/api-client'

import type {
  CalendarHolidaysApiResponse,
  HolidayMap,
} from '../types/calendar-holiday-api.types'

export interface HolidayProvider {
  getMonth(params: { year: number; month: number; signal?: AbortSignal }): Promise<HolidayMap>
}

async function fetchHolidayMap(params: {
  path: '/api/calendar/holidays' | '/api/calendar/anniversaries' | '/api/calendar/sundry'
  year: number
  month: number
  signal?: AbortSignal
}): Promise<HolidayMap> {
  const data = await apiGet<CalendarHolidaysApiResponse>({
    path: params.path,
    query: { year: params.year, month: params.month },
    signal: params.signal,
  })

  return data.holidays ?? {}
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
    const maps = await Promise.all(this.providers.map(provider => provider.getMonth(params)))
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
