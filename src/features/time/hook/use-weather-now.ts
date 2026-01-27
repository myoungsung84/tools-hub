'use client'

import * as React from 'react'

import { REGION_CONFIG, WeatherRegion } from '@/features/time/constants/weather-region.constants'
import { mapWeatherNow } from '@/features/time/mappers/weather-now.mapper'
import type {
  Coords,
  WeatherNow,
  WeatherNowApiResponse,
} from '@/features/time/types/weather-now.types'
import type { ApiResponse } from '@/lib/shared'

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

async function fetchWeatherNowApi(
  params: { lat: number; lon: number; timezone: string; locationLabel: string },
  signal: AbortSignal
): Promise<WeatherNow> {
  const q = new URLSearchParams({
    lat: String(params.lat),
    lon: String(params.lon),
    timezone: params.timezone,
    locationLabel: params.locationLabel,
  })

  const res = await fetch(`/api/weather/now?${q.toString()}`, { signal })
  const json = (await res.json()) as ApiResponse<WeatherNowApiResponse>

  if (!res.ok || !json.success) {
    throw new Error(!json.success ? json.error.message : `http ${res.status}`)
  }

  return mapWeatherNow(json.data)
}

export function useWeatherNow(region: WeatherRegion = 'SEOUL') {
  const [data, setData] = React.useState<WeatherNow | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let alive = true
    const ac = new AbortController()

    const run = async () => {
      setLoading(true)

      try {
        const cfg = REGION_CONFIG[region]
        const w = await fetchWeatherNowApi(
          {
            lat: cfg.coords.latitude,
            lon: cfg.coords.longitude,
            timezone: cfg.timezone,
            locationLabel: cfg.label,
          },
          ac.signal
        )

        if (!alive) return
        setData(w)
      } catch {
        if (!alive) return
        setData(null)
      } finally {
        if (alive) setLoading(false)
      }
    }

    run()

    return () => {
      alive = false
      ac.abort()
    }
  }, [region])

  return { data, loading }
}

type UseWeatherNowManyOptions = {
  regions: WeatherRegion[]
  includeCurrent?: boolean
  preferGeolocation?: boolean
}

export function useWeatherNowMany(options: UseWeatherNowManyOptions) {
  const { regions, includeCurrent = false, preferGeolocation = false } = options

  const [data, setData] = React.useState<Partial<Record<WeatherRegion | 'CURRENT', WeatherNow>>>({})
  const [loading, setLoading] = React.useState(true)

  // ✅ deps 안정화용: uniq/sort된 지역 목록을 "문자열 key"로 만든다
  const regionsKey = React.useMemo(() => {
    const uniq = Array.from(new Set(regions))
    uniq.sort()
    return uniq.join('|')
  }, [regions])

  React.useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    ;(async () => {
      try {
        const next: Partial<Record<WeatherRegion | 'CURRENT', WeatherNow>> = {}

        // ✅ effect 내부에서 key → list 재구성 (eslint deps 경고 제거)
        const regionList = regionsKey ? (regionsKey.split('|') as WeatherRegion[]) : []

        const currentCoords = includeCurrent && preferGeolocation ? await getCoordsOnce() : null

        const promises: Promise<void>[] = []

        if (includeCurrent && currentCoords) {
          promises.push(
            fetchWeatherNowApi(
              {
                lat: currentCoords.latitude,
                lon: currentCoords.longitude,
                timezone: 'Asia/Seoul',
                locationLabel: '현재 위치',
              },
              ac.signal
            ).then(w => {
              next.CURRENT = w
            })
          )
        }

        for (const region of regionList) {
          const cfg = REGION_CONFIG[region]
          promises.push(
            fetchWeatherNowApi(
              {
                lat: cfg.coords.latitude,
                lon: cfg.coords.longitude,
                timezone: cfg.timezone,
                locationLabel: cfg.label,
              },
              ac.signal
            ).then(w => {
              next[region] = w
            })
          )
        }

        await Promise.all(promises)

        if (ac.signal.aborted) return
        setData(next)
      } catch {
        if (ac.signal.aborted) return
        setData({})
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    })()

    return () => {
      ac.abort()
    }
  }, [regionsKey, includeCurrent, preferGeolocation])

  // ✅ UI에서 map 돌리기 편하게 regionList도 함께 반환
  const regionList = React.useMemo(
    () => (regionsKey ? (regionsKey.split('|') as WeatherRegion[]) : []),
    [regionsKey]
  )

  return { data, loading, regionList }
}
