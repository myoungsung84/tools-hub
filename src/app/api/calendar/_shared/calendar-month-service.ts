import type {
  CalendarMonthApiResponse,
  CalendarMonthSourceStatus,
  HolidayItem,
  HolidayMap,
} from '@/features/calendar/lib/types/calendar-holiday-api.types'
import { ApiErrors } from '@/lib/server'

import { fetchCalendarAnniversariesExternal } from '../anniversaries/anniversaries.source'
import { fetchCalendarHolidaysExternal } from '../holidays/holidays.source'
import { fetchCalendarSundryExternal } from '../sundry/sundry.source'
import {
  clearInFlightCalendarMonth,
  getCachedCalendarMonth,
  getCalendarMonthCacheKey,
  getInFlightCalendarMonth,
  setCachedCalendarMonth,
  setInFlightCalendarMonth,
} from './calendar-month-cache'

type ExternalCalendarItem = Pick<HolidayItem, 'date' | 'name' | 'isHoliday' | 'kind'>

type SourceKey = 'holidays' | 'anniversaries' | 'sundry'

type SourceResult = {
  key: SourceKey
  items: ExternalCalendarItem[]
}

function addItemsToHolidayMap(holidayMap: HolidayMap, items: ExternalCalendarItem[]) {
  for (const item of items) {
    const list = (holidayMap[item.date] ??= [])
    const exists = list.some(
      current =>
        current.name === item.name &&
        current.source === 'external' &&
        current.kind === item.kind
    )

    if (!exists) {
      list.push({
        date: item.date,
        name: item.name,
        source: 'external',
        isHoliday: item.isHoliday,
        kind: item.kind,
      })
    }
  }
}

async function buildCalendarMonth(params: {
  year: number
  month: number
}): Promise<CalendarMonthApiResponse> {
  const sourceRequests: Array<Promise<SourceResult>> = [
    fetchCalendarHolidaysExternal(params).then(items => ({ key: 'holidays', items })),
    fetchCalendarAnniversariesExternal(params).then(items => ({ key: 'anniversaries', items })),
    fetchCalendarSundryExternal(params).then(items => ({ key: 'sundry', items })),
  ]

  const settled = await Promise.allSettled(sourceRequests)
  const sources: Record<SourceKey, CalendarMonthSourceStatus> = {
    holidays: 'failed',
    anniversaries: 'failed',
    sundry: 'failed',
  }
  const holidays: HolidayMap = {}

  for (const result of settled) {
    if (result.status !== 'fulfilled') continue

    sources[result.value.key] = 'success'
    addItemsToHolidayMap(holidays, result.value.items)
  }

  const successCount = Object.values(sources).filter(status => status === 'success').length
  if (successCount === 0) {
    throw ApiErrors.upstream('calendar month sources failed')
  }

  const generatedAt = new Date().toISOString()

  return {
    year: params.year,
    month: params.month,
    holidays,
    fetchedAt: generatedAt,
    meta: {
      cached: false,
      generatedAt,
      sources,
    },
  }
}

export async function getCalendarMonth(params: {
  year: number
  month: number
}): Promise<CalendarMonthApiResponse> {
  const cacheKey = getCalendarMonthCacheKey(params)
  const cached = getCachedCalendarMonth(cacheKey)
  if (cached) return cached

  const inFlight = getInFlightCalendarMonth(cacheKey)
  if (inFlight) return inFlight

  const request = buildCalendarMonth(params)
    .then(payload => {
      setCachedCalendarMonth(payload)
      return payload
    })
    .finally(() => {
      clearInFlightCalendarMonth(cacheKey)
    })

  setInFlightCalendarMonth(cacheKey, request)

  return request
}
