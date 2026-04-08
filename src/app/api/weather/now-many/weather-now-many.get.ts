import { z } from 'zod'

import type { WeatherNowManyApiResponse } from '@/features/weather/types'
import { handleApi, parseParams, success } from '@/lib/server'
import { zString } from '@/lib/shared'

import { fetchWeatherNowManyFromOpenMeteo } from './weather-now-many.source'

const timezonePattern = /^[A-Za-z0-9_]+\/[A-Za-z0-9_]+(?:\/[A-Za-z0-9_]+)*$/
const labelPattern = /^[\p{L}\p{N}\s\-_.,()\/]+$/u
const locationIdPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/

const zWeatherNowManyLocation = z.object({
  id: zString.max(64).regex(locationIdPattern, 'Invalid location id'),
  label: zString.max(64).regex(labelPattern, 'Invalid location label'),
  latitude: z.number().finite(),
  longitude: z.number().finite(),
  timezone: zString.max(64).regex(timezonePattern, 'Invalid timezone'),
})

const zWeatherNowManyLocations = zString
  .max(6000)
  .transform((value, ctx) => {
    try {
      return JSON.parse(value) as unknown
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid locations JSON',
      })
      return z.NEVER
    }
  })
  .pipe(
    z
      .array(zWeatherNowManyLocation)
      .min(1)
      .max(16)
      .superRefine((locations, ctx) => {
        const seenIds = new Set<string>()

        locations.forEach((location, index) => {
          if (seenIds.has(location.id)) {
            ctx.addIssue({
              code: 'custom',
              message: 'Duplicate location id',
              path: [index, 'id'],
            })
            return
          }

          seenIds.add(location.id)
        })
      })
  )

async function handler(req: Request) {
  const { searchParams } = new URL(req.url)

  const { locations } = parseParams(
    z.object({
      locations: zWeatherNowManyLocations,
    }),
    Object.fromEntries(searchParams),
    { message: 'Invalid query' }
  )

  const base = await fetchWeatherNowManyFromOpenMeteo(locations, {
    revalidateSec: 300,
  })

  const payload: WeatherNowManyApiResponse = {
    ...base,
    fetchedAt: new Date().toISOString(),
  }

  return success(payload)
}

export const GET = handleApi(handler, {
  tag: '[api.weather.now-many]',
  internalMessage: 'weather many fetch failed',
})
