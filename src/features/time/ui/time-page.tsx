'use client'

import { isNil } from 'lodash-es'
import { CalendarDays, Clock3 } from 'lucide-react'
import { useMemo } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { useSyncedNow } from '@/features/time/hook/use-synced-now'
import { clockParts, currentDate } from '@/lib/shared'

import { WeatherTalk } from '../components/weather-talk'
import { useWeatherNowMany } from '../hook/use-weather-now'

export default function TimePage() {
  const now = useSyncedNow()
  const regions = useMemo(() => ['SEOUL', 'BUSAN', 'GWANGJU', 'JEJU'] as const, [])
  const { data, regionList } = useWeatherNowMany([...regions])

  if (isNil(now)) {
    return (
      <div className='flex w-full flex-1 items-center justify-center px-4'>
        <div className='w-full max-w-[520px] space-y-4'>
          <Skeleton className='h-8 w-32 mx-auto' />
          <Skeleton className='h-36 w-full rounded-3xl' />
          <div className='grid grid-cols-4 gap-2'>
            <Skeleton className='h-20 rounded-xl' />
            <Skeleton className='h-20 rounded-xl' />
            <Skeleton className='h-20 rounded-xl' />
            <Skeleton className='h-20 rounded-xl' />
          </div>
        </div>
      </div>
    )
  }

  const { meridiem, hh, mm, ss } = clockParts(now)
  const dateLine = currentDate(now)

  return (
    <div className='relative mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-center justify-center gap-8 px-6 py-12 text-center overflow-x-hidden'>
      {/* Background Glow (mobile-safe) */}
      <div
        className='pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                 w-[360px] sm:w-[600px]
                 h-[260px] sm:h-[400px]
                 bg-indigo-500/5 rounded-full
                 blur-[100px] sm:blur-[120px]
                 -z-10'
      />

      {/* AM/PM Badge */}
      <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md'>
        <Clock3 className='w-3 h-3' />
        {meridiem}
      </div>

      {/* Digital Clock */}
      <div className='flex flex-col items-center gap-6 font-mono tabular-nums leading-none'>
        <div className='flex items-baseline justify-center gap-1 sm:gap-3'>
          <span className='text-[clamp(64px,15vw,160px)] font-black tracking-tighter bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-2xl'>
            {hh}
          </span>
          <span className='animate-pulse text-[clamp(40px,10vw,100px)] font-light text-muted-foreground/30'>
            :
          </span>
          <span className='text-[clamp(64px,15vw,160px)] font-black tracking-tighter bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-2xl'>
            {mm}
          </span>
          <span className='animate-pulse text-[clamp(40px,10vw,100px)] font-light text-muted-foreground/30'>
            :
          </span>
          <span className='text-[clamp(64px,15vw,160px)] font-black tracking-tighter bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-2xl'>
            {ss}
          </span>
        </div>

        {/* Divider */}
        <div className='relative h-px w-full max-w-[600px]'>
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent' />
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent blur-sm' />
        </div>
      </div>

      {/* Date */}
      <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground/80 sm:text-base'>
        <CalendarDays className='w-4 h-4' />
        {dateLine}
      </div>

      {/* Weather Dashboard */}
      <div className='mt-10 w-full max-w-[940px] animate-in fade-in slide-in-from-bottom-6 duration-1000'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {regionList.map(r => (
            <div
              key={r}
              className='group relative overflow-hidden rounded-[22px]
                       border border-white/[0.05] bg-neutral-950/20
                       p-0 transition-all duration-500
                       sm:hover:border-white/20 sm:hover:bg-neutral-900/40
                       sm:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]
                       sm:hover:-translate-y-1.5'
            >
              <div className='absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/[0.02] group-hover:ring-white/[0.1] transition-all' />
              <WeatherTalk weather={data[r] ?? null} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
