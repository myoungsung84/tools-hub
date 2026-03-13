'use client'

import * as React from 'react'

import { mapWeatherHourly, mapWeatherNow } from '@/features/weather/mappers'
import type { Coords, WeatherHourly, WeatherNow } from '@/features/weather/types'
import { apiRequest } from '@/lib/client'

export type WeatherLocation = {
  id: string
  label: string
  country: string
  timezone: string
  coords: Coords
}

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

async function fetchWeatherHourlyApi(
  params: {
    lat: number
    lon: number
    timezone: string
    locationLabel: string
    hours?: number
  },
  signal: AbortSignal
) {
  return apiRequest({
    method: 'GET',
    path: '/api/weather/hourly',
    query: params,
    signal,
    map: mapWeatherHourly,
  })
}

export function useWeatherNowByLocation(location: WeatherLocation | null) {
  const [data, setData] = React.useState<WeatherNow | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!location) {
      // location이 null인 경우 이전 데이터를 정리하고 로딩 상태를 종료한다.
      setData(null)
      setLoading(false)
      return
    }

    let alive = true
    const ac = new AbortController()

    const run = async () => {
      setLoading(true)

      try {
        const next = await fetchWeatherNowApi(
          {
            lat: location.coords.latitude,
            lon: location.coords.longitude,
            timezone: location.timezone,
            locationLabel: location.label,
          },
          ac.signal
        )

        if (!alive) return
        setData(next)
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
  }, [location])

  return { data, loading }
}

export function useWeatherHourlyByLocation(location: WeatherLocation | null, hours = 24) {
  const [data, setData] = React.useState<WeatherHourly | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!location) {
      // location이 null인 경우 이전 데이터를 정리하고 로딩 상태를 종료한다.
      setData(null)
      setLoading(false)
      return
    }

    let alive = true
    const ac = new AbortController()

    const run = async () => {
      setLoading(true)
      try {
        const next = await fetchWeatherHourlyApi(
          {
            lat: location.coords.latitude,
            lon: location.coords.longitude,
            timezone: location.timezone,
            locationLabel: location.label,
            hours,
          },
          ac.signal
        )

        if (!alive) return
        setData(next)
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
  }, [location, hours])

  return { data, loading }
}

export function useWeatherNowMany(locations: WeatherLocation[]) {
  const [data, setData] = React.useState<Partial<Record<string, WeatherNow>>>({})
  const [loading, setLoading] = React.useState(true)

  const locationsRef = React.useRef(locations)
  locationsRef.current = locations

  const locationsKey = React.useMemo(
    () =>
      locations
        .map(
          location =>
            `${location.id}:${location.coords.latitude}:${location.coords.longitude}:${location.timezone}:${location.label}`
        )
        .join('|'),
    [locations]
  )

  React.useEffect(() => {
    const ac = new AbortController()
    const currentLocations = locationsRef.current
    setLoading(true)

    ;(async () => {
      try {
        const next: Record<string, WeatherNow> = {}
        const tasks = currentLocations.map(location =>
          fetchWeatherNowApi(
            {
              lat: location.coords.latitude,
              lon: location.coords.longitude,
              timezone: location.timezone,
              locationLabel: location.label,
            },
            ac.signal
          )
            .then(now => {
              next[location.id] = now
            })
            .catch(() => {})
        )

        await Promise.all(tasks)

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
  }, [locationsKey])

  return { data, loading }
}
