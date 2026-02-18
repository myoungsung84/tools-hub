import { z } from 'zod'

import type {
  CalendarHolidaysApiResponse,
  HolidayMap,
} from '@/features/calendar/lib/types/calendar-holiday-api.types'
import { handleApi, parseParams, success } from '@/lib/server'

import { fetchCalendarHolidaysExternal } from './holidays.source'

async function handler(req: Request) {
  const { searchParams } = new URL(req.url)

  const { year, month } = parseParams(
    z.object({
      year: z.coerce.number().int().min(1900).max(2100),
      month: z.coerce.number().int().min(1).max(12),
    }),
    Object.fromEntries(searchParams),
    { message: 'Invalid query' }
  )

  const external = await fetchCalendarHolidaysExternal({ year, month, revalidateSec: 60 * 60 * 12 })

  const holidays: HolidayMap = {}
  for (const item of external) {
    const list = (holidays[item.date] ??= [])
    if (!list.some(h => h.name === item.name && h.source === 'external' && h.kind === item.kind)) {
      list.push({
        date: item.date,
        name: item.name,
        source: 'external',
        isHoliday: item.isHoliday,
        kind: item.kind,
      })
    }
  }

  const payload: CalendarHolidaysApiResponse = {
    year,
    month,
    holidays,
    fetchedAt: new Date().toISOString(),
  }

  return success(payload)
}

export const GET = handleApi(handler, {
  tag: '[api.calendar.holidays]',
  internalMessage: 'calendar holidays fetch failed',
})
