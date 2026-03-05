'use client'

import { isNil } from 'lodash-es'
import { useMemo } from 'react'

import { useSyncedNow } from '@/features/time/hook/use-synced-now'
import { clockParts, currentDate } from '@/lib/shared'

import { useWeatherNowMany } from '../hook/use-weather-now'
import TimeAmpmBadge from './components/time-ampm-badge'
import TimeBackgroundGlow from './components/time-background-glow'
import TimeDateLine from './components/time-date-line'
import TimeDigitalClock from './components/time-digital-clock'
import TimePageSkeleton from './components/time-page-skeleton'
import WeatherDashboard from './components/weather-dashboard'

export default function TimePage() {
  const now = useSyncedNow()
  const regions = useMemo(() => ['SEOUL', 'BUSAN', 'GWANGJU', 'JEJU'] as const, [])
  const { data, regionList } = useWeatherNowMany([...regions])

  if (isNil(now)) {
    return <TimePageSkeleton />
  }

  const { meridiem, hh, mm, ss } = clockParts(now)
  const dateLine = currentDate(now)

  return (
    <div className='relative w-full flex flex-1 flex-col items-center justify-center gap-8'>
      <TimeBackgroundGlow />
      <TimeAmpmBadge meridiem={meridiem} />
      <TimeDigitalClock hh={hh} mm={mm} ss={ss} />
      <TimeDateLine dateLine={dateLine} />
      <WeatherDashboard regionList={regionList} data={data} />
    </div>
  )
}
