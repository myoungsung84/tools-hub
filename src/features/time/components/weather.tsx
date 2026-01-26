'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type { WeatherNow } from '@/features/time/hook/useWeatherNow'

type Props = { weather: WeatherNow | null }

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className='inline-flex items-center rounded-md px-2 py-1 text-[11px] leading-none text-muted-foreground'>
      {children}
    </span>
  )
}

export function Weather({ weather }: Props) {
  const cardClass =
    'rounded-xl border bg-neutral-900/60 p-3 backdrop-blur-sm transition-colors h-[92px]'

  if (!weather) {
    return (
      <div className={cardClass}>
        <div className='flex h-full flex-col justify-center gap-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <Skeleton className='h-[20px] w-16 rounded-md' />
            <Skeleton className='h-[20px] w-24 rounded-md' />
          </div>

          <Skeleton className='h-[20px] w-40 rounded-md' />
          <Skeleton className='h-[20px] w-28 rounded-md' />
        </div>
      </div>
    )
  }

  return (
    <div className={`${cardClass} hover:bg-neutral-900/70`}>
      <div className='flex h-full flex-col justify-center gap-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <Pill>
            <span className='font-medium text-foreground'>{weather.locationLabel}</span>
          </Pill>
          <Pill>{weather.label}</Pill>
        </div>

        <Pill>
          <span className='tabular-nums text-foreground'>{weather.tempC}°C</span>
          {weather.feelsLikeC != null && (
            <span className='ml-1 tabular-nums text-muted-foreground'>
              (체감 {weather.feelsLikeC}°)
            </span>
          )}
        </Pill>

        <Pill>
          <span className='tabular-nums'>바람 {weather.windMs ?? '-'}m/s</span>
        </Pill>
      </div>
    </div>
  )
}
