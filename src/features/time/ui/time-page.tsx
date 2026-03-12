'use client'

import { useMemo } from 'react'

import { useSyncedNow } from '@/features/time/hook/use-synced-now'
import { buildWorldTimes } from '@/features/time/lib/world-time'

import TimeBackgroundGlow from './components/time-background-glow'
import TimeMainClock from './components/time-main-clock'
import TimePageSkeleton from './components/time-page-skeleton'
import TimeSubClocks from './components/time-sub-clocks'

export default function TimePage() {
  const now = useSyncedNow()
  const worldTimes = useMemo(() => (now ? buildWorldTimes(now) : []), [now])

  if (!now) {
    return <TimePageSkeleton />
  }

  return (
    <div className='relative w-full flex flex-1 flex-col items-center justify-center gap-8'>
      <TimeBackgroundGlow />
      <TimeMainClock now={now} />
      <TimeSubClocks clocks={worldTimes} />
    </div>
  )
}
