'use client'

import { MapPin } from 'lucide-react'

import {
  formatCoord,
  formatLocalTime,
  formatTimeLabel,
  tempColorClass,
  weatherComment,
  weatherMeta,
} from '@/features/weather/lib'
import type { WeatherNow } from '@/features/weather/types'
import { cn } from '@/lib/shared'

import type { WeatherLocation } from '../../hook'

interface StatTileProps {
  label: string
  value: string
  shimmer?: boolean
  priority?: 'primary' | 'secondary'
}

function StatTile({ label, value, shimmer = false, priority = 'secondary' }: StatTileProps) {
  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-2.5',
        priority === 'primary' ? 'border-white/12 bg-white/7' : 'border-white/6 bg-white/[0.025]'
      )}
    >
      <p
        className={cn(
          'text-[10px] uppercase tracking-widest',
          priority === 'primary' ? 'text-white/45' : 'text-white/28'
        )}
      >
        {label}
      </p>
      {shimmer ? (
        <div className='mt-1 h-[1.25rem] w-16 animate-pulse rounded bg-white/10' />
      ) : (
        <p
          className={cn(
            'mt-1 truncate text-sm tabular-nums',
            priority === 'primary' ? 'font-semibold text-white/85' : 'font-medium text-white/45'
          )}
        >
          {value}
        </p>
      )}
    </div>
  )
}

type MainWeatherPanelProps = {
  selectedCity: WeatherLocation
  now: Date | null
  mainNow: WeatherNow | null
  isLoading: boolean
}

export function WeatherMainPanel({ selectedCity, now, mainNow, isLoading }: MainWeatherPanelProps) {
  const tempC = mainNow?.tempC

  const gradientClass =
    tempC != null && tempC >= 28
      ? 'from-orange-400'
      : tempC != null && tempC <= 0
        ? 'from-blue-400'
        : 'from-white'

  return (
    <div className='border-b border-white/8' data-testid='weather-main-panel'>
      <div className='relative overflow-hidden px-5 py-6'>
        <div
          className={cn(
            'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-[0.04] transition-all duration-700',
            gradientClass
          )}
        />

        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <div className='flex items-center gap-1 text-[10px] text-white/25'>
              <MapPin className='h-3 w-3 shrink-0' />
              <span className='truncate'>{formatCoord(selectedCity.coords)}</span>
            </div>
            <h2 className='mt-0.5 truncate text-2xl font-bold tracking-tight text-white/90'>
              {selectedCity.label}
            </h2>
            <p className='mt-0.5 text-xs text-white/35'>{selectedCity.country}</p>
          </div>

          <div className='shrink-0 text-right'>
            <p className='text-[9px] uppercase tracking-widest text-white/25'>현지 시각</p>
            <p className='mt-0.5 text-lg font-light tabular-nums text-white/55'>
              {now ? formatLocalTime(now, selectedCity.timezone) : '--:--'}
            </p>
          </div>
        </div>

        <div className='mt-6 flex items-end gap-4'>
          {isLoading ? (
            <>
              <div className='h-16 w-28 animate-pulse rounded-xl bg-white/8' />
              <div className='space-y-2 pb-1'>
                <div className='h-3.5 w-16 animate-pulse rounded bg-white/8' />
                <div className='h-3 w-36 animate-pulse rounded bg-white/5' />
              </div>
            </>
          ) : (
            <>
              <div className='flex items-start gap-1'>
                <p
                  className={cn(
                    'text-8xl font-thin tabular-nums leading-none transition-colors duration-500',
                    tempColorClass(mainNow?.tempC)
                  )}
                >
                  {mainNow?.tempC != null ? `${mainNow.tempC}` : '--'}
                </p>
                <span
                  className={cn(
                    'mt-2 text-3xl font-thin transition-colors duration-500',
                    tempColorClass(mainNow?.tempC)
                  )}
                >
                  °
                </span>
              </div>

              <div className='min-w-0 pb-2'>
                <div className='flex items-center gap-1.5'>
                  {(() => {
                    const { Icon, colorClass } = weatherMeta(mainNow?.label)
                    return <Icon className={cn('h-4 w-4 shrink-0', colorClass)} />
                  })()}
                  <p className='text-base font-semibold text-white/75'>
                    {mainNow?.label ?? '정보 없음'}
                  </p>
                </div>
                {weatherComment(mainNow?.tempC, mainNow?.label) && (
                  <p className='mt-1.5 text-[11px] leading-relaxed text-white/38'>
                    {weatherComment(mainNow?.tempC, mainNow?.label)}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className='mt-5 grid grid-cols-2 gap-1.5 sm:grid-cols-4'>
          <StatTile
            label='체감온도'
            value={mainNow?.feelsLikeC != null ? `${mainNow.feelsLikeC}°C` : '-'}
            shimmer={isLoading}
            priority='primary'
          />
          <StatTile
            label='바람'
            value={mainNow?.windMs != null ? `${mainNow.windMs} m/s` : '-'}
            shimmer={isLoading}
            priority='primary'
          />
          <StatTile
            label='시간대'
            value={selectedCity.timezone.split('/')[1]?.replace('_', ' ') ?? selectedCity.timezone}
            priority='secondary'
          />
          <StatTile
            label='갱신'
            value={mainNow ? formatTimeLabel(mainNow.fetchedAt, selectedCity.timezone) : '-'}
            shimmer={isLoading}
            priority='secondary'
          />
        </div>
      </div>
    </div>
  )
}
