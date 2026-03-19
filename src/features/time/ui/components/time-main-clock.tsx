import { CalendarDays, Clock3 } from 'lucide-react'

import { clockParts, currentDate } from '@/lib/shared'

type Props = {
  now: Date
}

export default function TimeMainClock({ now }: Props) {
  const { meridiem, hh, mm, ss } = clockParts(now)
  const dateLine = currentDate(now)

  return (
    <>
      <div
        className='inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md'
        data-testid='time-meridiem'
      >
        <Clock3 className='h-3 w-3' />
        {meridiem}
      </div>

      <div className='flex flex-col items-center gap-6 font-mono leading-none tabular-nums'>
        <div className='flex items-baseline justify-center gap-1 sm:gap-3'>
          <span
            className='bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-[clamp(64px,15vw,160px)] font-black tracking-tighter text-transparent drop-shadow-2xl'
            data-testid='time-hour'
          >
            {hh}
          </span>
          <span className='animate-pulse text-[clamp(40px,10vw,100px)] font-light text-muted-foreground/30'>
            :
          </span>
          <span
            className='bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-[clamp(64px,15vw,160px)] font-black tracking-tighter text-transparent drop-shadow-2xl'
            data-testid='time-minute'
          >
            {mm}
          </span>
          <span className='animate-pulse text-[clamp(40px,10vw,100px)] font-light text-muted-foreground/30'>
            :
          </span>
          <span
            className='bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-[clamp(64px,15vw,160px)] font-black tracking-tighter text-transparent drop-shadow-2xl'
            data-testid='time-second'
          >
            {ss}
          </span>
        </div>

        <div className='relative h-px w-full max-w-[600px]'>
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent' />
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent blur-sm' />
        </div>
      </div>

      <div
        className='flex items-center gap-2 text-sm font-medium text-muted-foreground/80 sm:text-base'
        data-testid='time-date'
      >
        <CalendarDays className='h-4 w-4' />
        {dateLine}
      </div>
    </>
  )
}
