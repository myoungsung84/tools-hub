import dayjs from 'dayjs'
import { isNil, round, sortBy } from 'lodash-es'
import { Agent, fetch as undiciFetch } from 'undici'

import type {
  WeatherNowManyApiResponse,
  WeatherNowManyItemApi,
  WeatherNowManyLocationInput,
} from '@/features/weather/types'
import { ApiErrors } from '@/lib/server'
import { cacheGetJson, cacheSetJson } from '@/lib/server/cache'

type WeatherNowManyFromOpenMeteo = Omit<WeatherNowManyApiResponse, 'fetchedAt'>

type OpenMeteoCurrentResponse = {
  current?: {
    temperature_2m?: number
    apparent_temperature?: number
    weather_code?: number
    wind_speed_10m?: number
  }
}

const inFlightRequests = new Map<string, Promise<WeatherNowManyFromOpenMeteo>>()

function cacheKey(locations: WeatherNowManyLocationInput[]) {
  const normalized = sortBy(locations, ['id', 'timezone', 'latitude', 'longitude']).map(
    location =>
      [
        location.id,
        location.label,
        location.timezone,
        round(location.latitude, 2),
        round(location.longitude, 2),
      ].join(':')
  )

  return `weather:now-many:${normalized.join('|')}`
}

function resolveTtlSec(revalidateSec?: number) {
  const base = revalidateSec ?? 30 * 60
  const bounded = Math.min(Math.max(Math.floor(base), 60), 60 * 60)
  const jitterMax = Math.max(30, Math.floor(bounded * 0.1))
  const jitter = Math.floor(Math.random() * jitterMax)
  return bounded + jitter
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
  return '변덕'
}

function hasRequiredCurrentFields(row: OpenMeteoCurrentResponse) {
  return !!row.current && typeof row.current.temperature_2m === 'number'
}

function mapCurrentToWeatherNowItem(
  location: WeatherNowManyLocationInput,
  response: OpenMeteoCurrentResponse
): WeatherNowManyItemApi {
  const current = response.current
  if (!current || typeof current.temperature_2m !== 'number') {
    throw ApiErrors.internal('open-meteo response missing temperature_2m')
  }

  const code = current.weather_code

  return {
    tempC: round(current.temperature_2m, 0),
    feelsLikeC:
      typeof current.apparent_temperature === 'number'
        ? round(current.apparent_temperature, 0)
        : undefined,
    windMs:
      typeof current.wind_speed_10m === 'number'
        ? round(current.wind_speed_10m / 3.6, 1)
        : undefined,
    code,
    label: toWeatherLabel(code),
    locationLabel: location.label,
  }
}

const openMeteoAgent = new Agent({
  connect: { family: 4 },
})

export async function fetchWeatherNowManyFromOpenMeteo(
  locations: WeatherNowManyLocationInput[],
  opts: { signal?: AbortSignal; revalidateSec?: number }
): Promise<WeatherNowManyFromOpenMeteo> {
  const ttlSec = resolveTtlSec(opts.revalidateSec)
  const key = cacheKey(locations)

  const cached = await cacheGetJson<WeatherNowManyFromOpenMeteo>(key)
  if (!isNil(cached)) {
    console.log(`[weather-now-many.source] redis cache hit: ${key}`)
    return cached
  }

  const inFlight = inFlightRequests.get(key)
  if (!isNil(inFlight)) {
    return inFlight
  }

  const request = (async () => {
    const normalizedLocations = locations.map(location => ({
      ...location,
      latitude: round(location.latitude, 2),
      longitude: round(location.longitude, 2),
    }))

    const latitude = normalizedLocations.map(location => location.latitude).join(',')
    const longitude = normalizedLocations.map(location => location.longitude).join(',')
    const timezone = normalizedLocations.map(location => location.timezone).join(',')

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${encodeURIComponent(latitude)}` +
      `&longitude=${encodeURIComponent(longitude)}` +
      `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&wind_speed_unit=kmh` +
      `&timezone=${encodeURIComponent(timezone)}`

    const requestedAtIso = dayjs().toISOString()

    let res
    try {
      res = await undiciFetch(url, {
        signal: opts.signal,
        dispatcher: openMeteoAgent,
      })
    } catch (e) {
      console.error('[open-meteo] multi current fetch failed', {
        requestedAtIso,
        url,
        err: String(e),
      })
      throw ApiErrors.upstream(`open-meteo multi current fetch failed (${requestedAtIso})`)
    }

    if (!res.ok) {
      throw ApiErrors.upstream(
        `open-meteo multi current bad response: ${res.status} (${requestedAtIso})`
      )
    }

    const json = (await res.json()) as unknown

    if (!Array.isArray(json)) {
      throw ApiErrors.internal('open-meteo multi current response must be an array')
    }

    const rows = json as OpenMeteoCurrentResponse[]

    if (rows.length !== locations.length) {
      throw ApiErrors.internal('open-meteo multi current response size mismatch')
    }

    rows.forEach((row, index) => {
      if (!hasRequiredCurrentFields(row)) {
        throw ApiErrors.internal(`open-meteo multi current row missing required fields (${index})`)
      }
    })

    const items = normalizedLocations.reduce<Record<string, WeatherNowManyItemApi>>((acc, location, index) => {
      acc[location.id] = mapCurrentToWeatherNowItem(location, rows[index] ?? {})
      return acc
    }, {})

    const out: WeatherNowManyFromOpenMeteo = {
      items,
    }

    await cacheSetJson(key, out, ttlSec)
    return out
  })()

  inFlightRequests.set(key, request)

  try {
    return await request
  } finally {
    inFlightRequests.delete(key)
  }
}
