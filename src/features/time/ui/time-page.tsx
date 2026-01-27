'use client'

import { isNil } from 'lodash-es'

import { Skeleton } from '@/components/ui/skeleton'
import { Weather } from '@/features/time/components/weather'
import { useSyncedNow } from '@/features/time/hook/use-synced-now'
import { useWeatherNowMany } from '@/features/time/hook/use-weather-now'
import { clockParts, currentDate } from '@/lib/shared'

export default function TimePage() {
  const now = useSyncedNow()

  const { data, regionList } = useWeatherNowMany([
    'SEOUL',
    'BUSAN',
    'INCHEON',
    'DAEGU',
    'GWANGJU',
    'DAEJEON',
    'ULSAN',
    'JEJU',
  ])

  if (isNil(now)) {
    return (
      <div className='flex min-h-screen w-full items-center justify-center'>
        <Skeleton className='h-36 w-[520px]' />
      </div>
    )
  }

  const { meridiem, hh, mm, ss } = clockParts(now)
  const dateLine = currentDate(now)

  return (
    <div className='flex w-full flex-col items-center justify-center gap-8 text-center'>
      {/* AM / PM */}
      <div className='text-s font-medium uppercase tracking-[0.32em] text-muted-foreground'>
        {meridiem}
      </div>

      {/* Clock */}
      <div className='flex flex-col items-center gap-6 font-mono tabular-nums text-[104px] leading-none sm:text-[120px]'>
        <div className='flex items-center justify-center gap-4'>
          <span>{hh}</span>
          <span className='translate-y-[2px] text-muted-foreground/70'>:</span>
          <span>{mm}</span>
          <span className='translate-y-[2px] text-muted-foreground/70'>:</span>
          <span>{ss}</span>
        </div>

        <div className='h-px w-[800px] max-w-full bg-gradient-to-r from-transparent via-border to-transparent' />
      </div>

      {/* Date */}
      <div className='text-s text-muted-foreground'>{dateLine}</div>

      {/* Weather */}
      <div className='mt-2 w-[800px] max-w-[92vw]'>
        <div className='grid grid-cols-4 gap-2'>
          {regionList.map(r => (
            <Weather key={r} weather={data[r] ?? null} />
          ))}
        </div>
      </div>
    </div>
  )
}
