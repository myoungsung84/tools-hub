import dayjs from 'dayjs'
import { isNil, round } from 'lodash-es'

import type { Coords, WeatherHourlyPointApi } from '@/features/weather/types'
import { ApiErrors } from '@/lib/server'

type WeatherHourlyFromOpenMeteo = {
  timezone: string
  points: WeatherHourlyPointApi[]
}

const inFlightRequests = new Map<string, Promise<WeatherHourlyFromOpenMeteo>>()

function cacheKey(coords: Coords, timezone: string, hours: number) {
  const latitude = round(coords.latitude, 2)
  const longitude = round(coords.longitude, 2)
  return `weather:hourly:${timezone}:${hours}:${latitude},${longitude}`
}

function normalizeHours(hours: number) {
  if (!Number.isFinite(hours)) return 24
  return Math.min(Math.max(Math.floor(hours), 1), 48)
}

function resolveRevalidateSec(revalidateSec?: number) {
  const base = revalidateSec ?? 45 * 60
  return Math.min(Math.max(Math.floor(base), 60), 2 * 60 * 60)
}

function toWeatherLabel(code?: number) {
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
  return '변동'
}

export async function fetchWeatherHourlyFromOpenMeteo(
  coords: Coords,
  opts: {
    timezone: string
    hours: number
    signal?: AbortSignal
    revalidateSec?: number
  }
): Promise<WeatherHourlyFromOpenMeteo> {
  const safeHours = normalizeHours(opts.hours)
  const latitude = round(coords.latitude, 2)
  const longitude = round(coords.longitude, 2)
  const revalidateSec = resolveRevalidateSec(opts.revalidateSec)
  const key = cacheKey(coords, opts.timezone, safeHours)

  const inFlight = inFlightRequests.get(key)
  if (!isNil(inFlight)) {
    return inFlight
  }

  const request = (async () => {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m` +
      `&forecast_hours=${safeHours}` +
      `&wind_speed_unit=kmh` +
      `&timeformat=unixtime` +
      `&timezone=${encodeURIComponent(opts.timezone)}`

    const requestedAtIso = dayjs().toISOString()

    let res
    try {
      res = await fetch(url, {
        signal: opts.signal,
        next: { revalidate: revalidateSec },
      })
    } catch (e) {
      console.error('[open-meteo] hourly fetch failed', { requestedAtIso, url, err: String(e) })
      throw ApiErrors.upstream(`open-meteo hourly fetch failed (${requestedAtIso})`)
    }

    if (!res.ok) {
      throw ApiErrors.upstream(`open-meteo hourly bad response: ${res.status} (${requestedAtIso})`)
    }

    const json = (await res.json()) as {
      timezone?: string
      hourly?: {
        time?: number[]
        temperature_2m?: number[]
        weather_code?: number[]
        precipitation_probability?: number[]
        wind_speed_10m?: number[]
      }
    }

    const hourly = json.hourly
    if (!hourly?.time || !hourly.temperature_2m) {
      throw ApiErrors.internal('open-meteo hourly response missing required fields')
    }

    const points: WeatherHourlyPointApi[] = hourly.time.map((time, index) => {
      const windKmh = hourly.wind_speed_10m?.[index]
      const windMs = typeof windKmh === 'number' ? round(windKmh / 3.6, 1) : undefined
      const code = hourly.weather_code?.[index]
      const precipitationProbability = hourly.precipitation_probability?.[index]

      return {
        time,
        temperature: round(hourly.temperature_2m?.[index] ?? 0, 0),
        code,
        condition: toWeatherLabel(code),
        precipitationProbability:
          typeof precipitationProbability === 'number'
            ? round(precipitationProbability, 0)
            : undefined,
        windSpeed: windMs,
      }
    })

    const out: WeatherHourlyFromOpenMeteo = {
      timezone: json.timezone ?? opts.timezone,
      points,
    }

    return out
  })()

  inFlightRequests.set(key, request)

  try {
    return await request
  } finally {
    inFlightRequests.delete(key)
  }
}
