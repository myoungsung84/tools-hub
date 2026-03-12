import type { Coords, WeatherHourlyApiResponse } from '@/features/weather/types'
import { handleApi, parseParams, success } from '@/lib/server'
import { zLatLon, zString, zStringWithDefault } from '@/lib/shared'

import { fetchWeatherHourlyFromOpenMeteo } from './weather-hourly.source'

async function handler(req: Request) {
  const { searchParams } = new URL(req.url)

  const { lat, lon, timezone, locationLabel, hours } = parseParams(
    zLatLon.extend({
      timezone: zString
        .max(64)
        .regex(/^[A-Za-z0-9_]+\/[A-Za-z0-9_]+(?:\/[A-Za-z0-9_]+)*$/, 'Invalid timezone')
        .optional()
        .default('Asia/Seoul'),
      locationLabel: zString
        .max(64)
        .regex(/^[\p{L}\p{N}\s\-_.,()\/]+$/u, 'Invalid location label')
        .optional()
        .default('현재 위치'),
      hours: zStringWithDefault('24'),
    }),
    Object.fromEntries(searchParams),
    { message: 'Invalid query' }
  )

  const coords: Coords = { latitude: lat, longitude: lon }
  const requestedHours = Number(hours)
  const safeHours = Number.isFinite(requestedHours)
    ? Math.min(Math.max(Math.floor(requestedHours), 1), 48)
    : 24

  const base = await fetchWeatherHourlyFromOpenMeteo(coords, {
    timezone,
    hours: safeHours,
    revalidateSec: 300,
  })

  const payload: WeatherHourlyApiResponse = {
    ...base,
    fetchedAt: new Date().toISOString(),
    locationLabel,
  }

  return success(payload)
}

export const GET = handleApi(handler, {
  tag: '[api.weather.hourly]',
  internalMessage: 'weather hourly fetch failed',
})
