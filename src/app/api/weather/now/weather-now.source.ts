import dayjs from 'dayjs'
import { round } from 'lodash-es'

import type { Coords, WeatherNowApiResponse } from '@/features/time/types/weather-now.types'
import { ApiErrors } from '@/lib/server'

export async function fetchWeatherNowFromOpenMeteo(
  coords: Coords,
  opts: { timezone: string; signal?: AbortSignal; revalidateSec?: number }
): Promise<Omit<WeatherNowApiResponse, 'fetchedAt' | 'locationLabel'>> {
  const latitude = round(coords.latitude, 2)
  const longitude = round(coords.longitude, 2)

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&wind_speed_unit=kmh` +
    `&timezone=${encodeURIComponent(opts.timezone)}`

  const requestedAtIso = dayjs().toISOString()

  let res: Response
  try {
    res = await fetch(url, {
      signal: opts.signal,
      next: { revalidate: opts.revalidateSec ?? 300 },
    })
  } catch {
    throw ApiErrors.upstream(`open-meteo fetch failed (${requestedAtIso})`)
  }

  if (!res.ok) {
    throw ApiErrors.upstream(`open-meteo bad response: ${res.status} (${requestedAtIso})`)
  }

  const json = (await res.json()) as {
    current?: {
      temperature_2m: number
      apparent_temperature?: number
      weather_code?: number
      wind_speed_10m?: number
    }
  }

  const current = json.current
  if (!current || typeof current.temperature_2m !== 'number') {
    throw ApiErrors.internal('open-meteo response missing temperature_2m')
  }

  const tempC = round(current.temperature_2m, 0)
  const feelsLikeC =
    typeof current.apparent_temperature === 'number'
      ? round(current.apparent_temperature, 0)
      : undefined

  const code = current.weather_code

  const windMs =
    typeof current.wind_speed_10m === 'number' ? round(current.wind_speed_10m / 3.6, 1) : undefined

  const label = (() => {
    if (code == null) return '날씨 정보 없음'
    if (code === 0) return '맑음'
    if (code === 1 || code === 2) return '대체로 맑음'
    if (code === 3) return '흐림'
    if (code === 45 || code === 48) return '안개'
    if (code === 51 || code === 53 || code === 55) return '이슬비'
    if (code === 61 || code === 63 || code === 65) return '비'
    if (code === 66 || code === 67) return '진눈깨비'
    if (code === 71 || code === 73 || code === 75) return '눈'
    if (code === 77) return '눈날림'
    if (code === 80 || code === 81 || code === 82) return '소나기'
    if (code === 85 || code === 86) return '소나기 눈'
    if (code === 95) return '뇌우'
    if (code === 96 || code === 99) return '뇌우(우박)'
    return '변덕'
  })()

  return {
    tempC,
    feelsLikeC,
    windMs,
    code,
    label,
  }
}
