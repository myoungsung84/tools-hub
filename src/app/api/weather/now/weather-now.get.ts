import type { Coords, WeatherNowApiResponse } from '@/features/time/types/weather-now.types'
import { handleApi, parseParams, success } from '@/lib/server'
import { zLatLon, zStringWithDefault } from '@/lib/shared'

import { fetchWeatherNowFromOpenMeteo } from './weather-now.source'

async function handler(req: Request) {
  const { searchParams } = new URL(req.url)

  const { lat, lon, timezone, locationLabel } = parseParams(
    zLatLon.extend({
      timezone: zStringWithDefault('Asia/Seoul'),
      locationLabel: zStringWithDefault('현재 위치'),
    }),
    Object.fromEntries(searchParams),
    { message: 'Invalid query' }
  )

  const coords: Coords = { latitude: lat, longitude: lon }

  const base = await fetchWeatherNowFromOpenMeteo(coords, {
    timezone,
    revalidateSec: 300,
  })

  const payload: WeatherNowApiResponse = {
    ...base,
    fetchedAt: new Date().toISOString(),
    locationLabel,
  }

  return success(payload)
}

export const GET = handleApi(handler, {
  tag: '[api.weather.now]',
  internalMessage: 'weather fetch failed',
})
