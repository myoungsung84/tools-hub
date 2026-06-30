import { z } from 'zod'

import { handleApi, parseParams, success } from '@/lib/server'

import { getCalendarMonth } from '../_shared/calendar-month-service'

const CACHE_CONTROL = 'public, s-maxage=604800, stale-while-revalidate=86400'

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

  const payload = await getCalendarMonth({ year, month })

  return success(payload, {
    headers: {
      'Cache-Control': CACHE_CONTROL,
    },
  })
}

export const GET = handleApi(handler, {
  tag: '[api.calendar.month]',
  internalMessage: 'calendar month fetch failed',
})
