'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useSyncedNow } from '@/features/time/hook/use-synced-now'
import { PINNED_CITY_IDS, WEATHER_CITIES } from '@/features/weather/constants'
import type { WeatherNow } from '@/features/weather/types'
import { cn } from '@/lib/shared'

import {
  useWeatherHourlyByLocation,
  useWeatherNowByLocation,
  useWeatherNowMany,
  type WeatherLocation,
} from '../hook'
import { WeatherCitiesPanel } from './components/weather-cities-panel'
import { WeatherCityTabs } from './components/weather-city-tabs'
import { type WeatherChartTab, WeatherHourlyPanel } from './components/weather-hourly-panel'
import { WeatherMainPanel } from './components/weather-main-panel'

export default function WeatherPage() {
  const [selectedCityId, setSelectedCityId] = useState<string>(WEATHER_CITIES[0]?.id ?? 'seoul')
  const [visible, setVisible] = useState(true)
  const [chartTab, setChartTab] = useState<WeatherChartTab>('temp')
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSelectCity = (id: string) => {
    if (id === selectedCityId) return
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setVisible(false)
    fadeTimerRef.current = setTimeout(() => {
      fadeTimerRef.current = null
      setSelectedCityId(id)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  const selectedCity = useMemo<WeatherLocation | null>(
    () => WEATHER_CITIES.find(city => city.id === selectedCityId) ?? WEATHER_CITIES[0] ?? null,
    [selectedCityId]
  )

  const now = useSyncedNow()

  const subCities = useMemo<WeatherLocation[]>(
    () => WEATHER_CITIES.filter(city => city.id !== selectedCity?.id),
    [selectedCity]
  )

  const { data: mainNow, loading: mainNowLoading } = useWeatherNowByLocation(selectedCity)
  const { data: mainHourly, loading: mainHourlyLoading } = useWeatherHourlyByLocation(
    selectedCity,
    24
  )
  const { data: subNowMap, loading: subLoading } = useWeatherNowMany(subCities)

  useEffect(() => {
    if (!mainNowLoading && mainNow) {
      const t = setTimeout(() => setVisible(true), 30)
      return () => clearTimeout(t)
    }
  }, [mainNowLoading, mainNow])

  const hourlyItems = useMemo(() => mainHourly?.points.slice(0, 12) ?? [], [mainHourly?.points])
  const isLoading = mainNowLoading || !mainNow

  const pinnedCities = useMemo(
    () => WEATHER_CITIES.filter(c => (PINNED_CITY_IDS as readonly string[]).includes(c.id)),
    []
  )

  const allNowMap = useMemo<Record<string, WeatherNow>>(() => {
    const map: Record<string, WeatherNow> = { ...subNowMap }
    if (mainNow && selectedCity) map[selectedCity.id] = mainNow
    return map
  }, [subNowMap, mainNow, selectedCity])

  if (!selectedCity) return null

  return (
    <div className='flex w-full min-w-0 flex-col gap-4'>
      <section className='overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_16px_48px_rgba(0,0,0,0.28)] backdrop-blur-md'>
        <WeatherCityTabs
          pinnedCities={pinnedCities}
          selectedCityId={selectedCityId}
          onSelectCity={handleSelectCity}
          nowMap={allNowMap}
        />
        <div
          className={cn(
            'flex flex-col transition-all duration-300 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
          )}
        >
          <WeatherMainPanel
            selectedCity={selectedCity}
            now={now}
            mainNow={mainNow}
            isLoading={isLoading}
          />
          <WeatherHourlyPanel
            isLoading={isLoading}
            mainHourlyLoading={mainHourlyLoading}
            hourlyItems={hourlyItems}
            timezone={selectedCity.timezone}
            chartTab={chartTab}
            onChangeChartTab={setChartTab}
          />
        </div>
      </section>

      <WeatherCitiesPanel
        subCities={subCities}
        subNowMap={subNowMap}
        subLoading={subLoading}
        now={now}
        onSelectCity={handleSelectCity}
      />
    </div>
  )
}
