'use client'

import { Navigation, Thermometer } from 'lucide-react'

import { formatLocalTime, tempColorClass, weatherMeta } from '@/features/weather/lib'
import type { WeatherNow } from '@/features/weather/types'
import { cn } from '@/lib/shared'

import type { WeatherLocation } from '../../hook'

type OtherCitiesPanelProps = {
  subCities: WeatherLocation[]
  subNowMap: Record<string, WeatherNow>
  subLoading: boolean
  now: Date | null
  onSelectCity: (id: string) => void
}

export function WeatherCitiesPanel({
  subCities,
  subNowMap,
  subLoading,
  now,
  onSelectCity,
}: OtherCitiesPanelProps) {
  return (
    <section className='w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-md'>
      <div className='border-b border-white/8 px-5 py-3'>
        <p className='text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30'>
          전 세계 도시
        </p>
      </div>

      <div className='grid grid-cols-1 divide-y divide-white/8 sm:grid-cols-2 lg:grid-cols-3'>
        {subCities.map(city => {
          const weather = subNowMap[city.id]
          const cityLoading = subLoading && !weather
          const { Icon: WeatherIcon, colorClass: weatherColor } = weatherMeta(weather?.label)

          return (
            <button
              key={city.id}
              type='button'
              onClick={() => onSelectCity(city.id)}
              className={cn(
                'group min-w-0 px-5 py-4 text-left transition-all duration-150 active:scale-[0.98]',
                'hover:bg-white/5 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-1 focus-visible:ring-white/20',
                'sm:odd:border-r sm:odd:border-white/8',
                'lg:odd:border-r-0',
                'lg:[&:nth-child(3n+2)]:border-l lg:[&:nth-child(3n+2)]:border-r lg:[&:nth-child(3n+2)]:border-white/8',
                'lg:[&:nth-child(3n)]:border-l lg:[&:nth-child(3n)]:border-white/8'
              )}
            >
              <div className='flex items-center justify-between gap-2'>
                <p className='min-w-0 truncate text-sm font-semibold text-white/80 transition-colors group-hover:text-white/95'>
                  {city.label}
                </p>
                {!cityLoading && (
                  <WeatherIcon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                      weatherColor
                    )}
                  />
                )}
              </div>

              <div className='mt-2 flex items-end justify-between gap-2'>
                {cityLoading ? (
                  <div className='h-8 w-14 animate-pulse rounded-md bg-white/8' />
                ) : (
                  <p
                    className={cn(
                      'text-3xl font-light tabular-nums leading-none transition-colors duration-300',
                      tempColorClass(weather?.tempC)
                    )}
                  >
                    {weather != null ? `${weather.tempC}°` : '--°'}
                  </p>
                )}
                <p
                  className={cn(
                    'min-w-0 truncate text-xs font-medium',
                    cityLoading ? 'text-transparent' : weatherColor
                  )}
                >
                  {weather?.label ?? '—'}
                </p>
              </div>

              <div className='mt-2.5 flex items-center gap-3 text-[10px] text-white/25'>
                <span className='inline-flex items-center gap-1'>
                  <Thermometer className='h-3 w-3 shrink-0' />
                  체감 {weather?.feelsLikeC != null ? `${weather.feelsLikeC}°` : '-'}
                </span>
                <span className='inline-flex items-center gap-1'>
                  <Navigation className='h-3 w-3 shrink-0' />
                  {weather?.windMs != null ? `${weather.windMs} m/s` : '-'}
                </span>
                <span className='ml-auto tabular-nums'>
                  {now ? formatLocalTime(now, city.timezone) : '--:--'}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
