'use client'

import type { WeatherNow } from '@/features/weather/types'
import { cn } from '@/lib/shared'

import type { WeatherLocation } from '../../hook'

type PinnedCityTabsProps = {
  pinnedCities: WeatherLocation[]
  selectedCityId: string
  onSelectCity: (id: string) => void
  nowMap: Partial<Record<string, WeatherNow>>
}

export function WeatherCityTabs({
  pinnedCities,
  selectedCityId,
  onSelectCity,
  nowMap,
}: PinnedCityTabsProps) {
  return (
    <nav
      className='grid border-b border-white/8 px-1.5 py-1.5'
      style={{ gridTemplateColumns: `repeat(${pinnedCities.length}, 1fr)` }}
      aria-label='주요 도시'
    >
      {pinnedCities.map(city => {
        const weather = nowMap[city.id]
        const isSelected = city.id === selectedCityId
        return (
          <button
            key={city.id}
            type='button'
            onClick={() => onSelectCity(city.id)}
            aria-pressed={isSelected}
            className={cn(
              'group flex flex-col items-center gap-0.5 rounded-lg py-2 transition-all duration-200 active:scale-95',
              isSelected ? 'bg-white/14 ring-1 ring-inset ring-white/18' : 'hover:bg-white/6'
            )}
          >
            <span
              className={cn(
                'text-xs font-medium transition-colors',
                isSelected ? 'text-white' : 'text-white/38 group-hover:text-white/65'
              )}
            >
              {city.label}
            </span>
            <span
              className={cn(
                'tabular-nums text-[10px] transition-colors',
                isSelected
                  ? 'font-semibold text-white/70'
                  : 'text-white/22 group-hover:text-white/40'
              )}
            >
              {weather != null ? `${weather.tempC}°` : '···'}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
