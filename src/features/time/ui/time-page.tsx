'use client'

import { isNil } from 'lodash-es'
import { useMemo } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { Weather } from '@/features/time/components/weather'
import { useSyncedNow } from '@/features/time/hook/use-synced-now'
import { clockParts, currentDate } from '@/lib/shared'

import { useWeatherNowMany } from '../hook/use-weather-now'

export default function TimePage() {
  const now = useSyncedNow()

  const regions = useMemo(() => ['SEOUL', 'BUSAN', 'GWANGJU', 'JEJU'] as const, [])

  const { data, regionList } = useWeatherNowMany([...regions])

  if (isNil(now)) {
    return (
      <div className='flex w-full flex-1 items-center justify-center px-4'>
        <Skeleton className='h-36 w-full max-w-[520px]' />
      </div>
    )
  }

  const { meridiem, hh, mm, ss } = clockParts(now)
  const dateLine = currentDate(now)

  return (
    <div className='mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center justify-center gap-6 px-4 text-center sm:gap-8'>
      {/* AM / PM */}
      <div className='text-xs font-medium uppercase tracking-[0.32em] text-muted-foreground sm:text-sm'>
        {meridiem}
      </div>

      {/* Clock */}
      <div className='flex flex-col items-center gap-4 font-mono tabular-nums leading-none sm:gap-6'>
        <div className='flex items-center justify-center gap-2 sm:gap-4'>
          <span className='text-[clamp(56px,12vw,120px)]'>{hh}</span>
          <span className='translate-y-[2px] text-[clamp(40px,8vw,84px)] text-muted-foreground/70'>
            :
          </span>
          <span className='text-[clamp(56px,12vw,120px)]'>{mm}</span>
          <span className='translate-y-[2px] text-[clamp(40px,8vw,84px)] text-muted-foreground/70'>
            :
          </span>
          <span className='text-[clamp(56px,12vw,120px)]'>{ss}</span>
        </div>

        <div className='h-px w-full max-w-[800px] bg-gradient-to-r from-transparent via-border to-transparent' />
      </div>

      {/* Date */}
      <div className='text-xs text-muted-foreground sm:text-sm'>{dateLine}</div>

      {/* Weather */}
      <div className='mt-2 w-full max-w-[800px]'>
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4'>
          {regionList.map(r => (
            <Weather key={r} weather={data[r] ?? null} />
          ))}
        </div>
      </div>
    </div>
  )
}
