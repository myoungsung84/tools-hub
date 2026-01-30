'use client'

import * as React from 'react'
import { useEffect } from 'react'

import { REGION_CONFIG, WeatherRegion } from '@/features/time/constants/weather-region.constants'
import { mapWeatherNow } from '@/features/time/mappers/weather-now.mapper'
import type { WeatherNow } from '@/features/time/types/weather-now.types'
import { apiRequest } from '@/lib/client'

async function fetchWeatherNowApi(
  params: { lat: number; lon: number; timezone: string; locationLabel: string },
  signal: AbortSignal
) {
  return apiRequest({
    method: 'GET',
    path: '/api/weather/now',
    query: params,
    signal,
    map: mapWeatherNow,
  })
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

export function useWeatherNowMany(regions: WeatherRegion[]) {
  const [data, setData] = React.useState<Partial<Record<WeatherRegion | 'CURRENT', WeatherNow>>>({})
  const [loading, setLoading] = React.useState(true)

  const regionsKey = React.useMemo(() => {
    const uniq = Array.from(new Set(regions))
    return uniq.join('|')
  }, [regions])

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    ;(async () => {
      try {
        const next: Partial<Record<WeatherRegion | 'CURRENT', WeatherNow>> = {}
        const regionList = regionsKey ? (regionsKey.split('|') as WeatherRegion[]) : []
        const promises: Promise<void>[] = []

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
            )
              .then(w => {
                next[region] = w
              })
              .catch(() => {})
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
  }, [regionsKey])

  const regionList = React.useMemo(
    () => (regionsKey ? (regionsKey.split('|') as WeatherRegion[]) : []),
    [regionsKey]
  )

  return { data, loading, regionList }
}
