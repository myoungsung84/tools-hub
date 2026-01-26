'use client'

import * as React from 'react'

type Coords = { latitude: number; longitude: number }

type OpenMeteoCurrent = {
  temperature_2m: number
  apparent_temperature?: number
  weather_code?: number
  wind_speed_10m?: number
}

type OpenMeteoResponse = {
  current?: OpenMeteoCurrent
}

export type WeatherNow = {
  tempC: number
  feelsLikeC?: number
  windMs?: number
  code?: number
  label: string
  fetchedAt: Date
  locationLabel: string
}

export const WEATHER_REGION = {
  SEOUL: 'SEOUL',
  BUSAN: 'BUSAN',
  INCHEON: 'INCHEON',
  DAEGU: 'DAEGU',
  GWANGJU: 'GWANGJU',
  DAEJEON: 'DAEJEON',
  ULSAN: 'ULSAN',
  SEJONG: 'SEJONG',
  SUWON: 'SUWON',
  GANGNEUNG: 'GANGNEUNG',
  JEONJU: 'JEONJU',
  CHANGWON: 'CHANGWON',
  JEJU: 'JEJU',
} as const

export type WeatherRegion = keyof typeof WEATHER_REGION

type RegionConfig = {
  label: string
  timezone: string
  coords: Coords
}

const REGION_CONFIG: Record<WeatherRegion, RegionConfig> = {
  SEOUL: {
    label: '서울',
    timezone: 'Asia/Seoul',
    coords: { latitude: 37.5665, longitude: 126.978 },
  },
  BUSAN: {
    label: '부산',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.1796, longitude: 129.0756 },
  },
  INCHEON: {
    label: '인천',
    timezone: 'Asia/Seoul',
    coords: { latitude: 37.4563, longitude: 126.7052 },
  },
  DAEGU: {
    label: '대구',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.8722, longitude: 128.6025 },
  },
  GWANGJU: {
    label: '광주',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.1595, longitude: 126.8526 },
  },
  DAEJEON: {
    label: '대전',
    timezone: 'Asia/Seoul',
    coords: { latitude: 36.3504, longitude: 127.3845 },
  },
  ULSAN: {
    label: '울산',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.5384, longitude: 129.3114 },
  },
  SEJONG: {
    label: '세종',
    timezone: 'Asia/Seoul',
    coords: { latitude: 36.48, longitude: 127.289 },
  },
  SUWON: {
    label: '수원',
    timezone: 'Asia/Seoul',
    coords: { latitude: 37.2636, longitude: 127.0286 },
  },
  GANGNEUNG: {
    label: '강릉',
    timezone: 'Asia/Seoul',
    coords: { latitude: 37.7519, longitude: 128.8761 },
  },
  JEONJU: {
    label: '전주',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.8242, longitude: 127.148 },
  },
  CHANGWON: {
    label: '창원',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.2279, longitude: 128.6811 },
  },
  JEJU: {
    label: '제주',
    timezone: 'Asia/Seoul',
    coords: { latitude: 33.4996, longitude: 126.5312 },
  },
}

function codeToKoLabel(code?: number) {
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

function msFromKmH(kmh?: number) {
  if (kmh == null) return undefined
  return Math.round((kmh / 3.6) * 10) / 10
}

async function getCoordsOnce(timeoutMs = 2500): Promise<Coords | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null

  return new Promise(resolve => {
    const timer = window.setTimeout(() => resolve(null), timeoutMs)

    navigator.geolocation.getCurrentPosition(
      pos => {
        window.clearTimeout(timer)
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
      },
      () => {
        window.clearTimeout(timer)
        resolve(null)
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: timeoutMs }
    )
  })
}

async function fetchWeatherNow(
  coords: Coords,
  opts: { timezone: string; abortSignal: AbortSignal }
): Promise<WeatherNow> {
  const { latitude, longitude } = coords

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&wind_speed_unit=kmh` +
    `&timezone=${encodeURIComponent(opts.timezone)}`

  const res = await fetch(url, { signal: opts.abortSignal })
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`)

  const json = (await res.json()) as OpenMeteoResponse
  const current = json.current

  if (!current || typeof current.temperature_2m !== 'number') {
    throw new Error('weather response missing temperature_2m')
  }

  const tempC = current.temperature_2m
  const feels = current.apparent_temperature
  const code = current.weather_code
  const windKmh = current.wind_speed_10m

  return {
    tempC: Math.round(tempC),
    feelsLikeC: typeof feels === 'number' ? Math.round(feels) : undefined,
    windMs: typeof windKmh === 'number' ? msFromKmH(windKmh) : undefined,
    code,
    label: codeToKoLabel(code),
    fetchedAt: new Date(),
    locationLabel: '현재 위치',
  }
}

type UseWeatherNowOptions = {
  preferGeolocation?: boolean
  refreshMs?: number
}

/**
 * - region: 지정 지역(기본 SEOUL)
 * - preferGeolocation: true면 "현재 위치"를 우선 시도하고 실패 시 region coords로 fallback
 * - refreshMs: 갱신 주기 (기본 10분)
 */
export function useWeatherNow(region: WeatherRegion = 'SEOUL', options: UseWeatherNowOptions = {}) {
  const { preferGeolocation = true, refreshMs = 10 * 60 * 1000 } = options

  const [data, setData] = React.useState<WeatherNow | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let alive = true
    let timer: number | null = null
    const ac = new AbortController()

    const run = async () => {
      setLoading(true)

      try {
        const cfg = REGION_CONFIG[region]

        const coords = (preferGeolocation ? await getCoordsOnce() : null) ?? cfg.coords

        const next = await fetchWeatherNow(coords, {
          timezone: cfg.timezone,
          abortSignal: ac.signal,
        })

        const locationLabel =
          coords.latitude === cfg.coords.latitude && coords.longitude === cfg.coords.longitude
            ? cfg.label
            : '현재 위치'

        if (!alive) return
        setData({ ...next, locationLabel })
      } catch {
        if (!alive) return
        setData(null)
      } finally {
        if (!alive) return
        setLoading(false)
        timer = window.setTimeout(run, refreshMs)
      }
    }

    run()

    return () => {
      alive = false
      ac.abort()
      if (timer) window.clearTimeout(timer)
    }
  }, [region, preferGeolocation, refreshMs])

  return { data, loading }
}
