'use client'

import dayjs from 'dayjs'
import { CalendarDays } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import PageHeader from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/shared'

import {
  CalendarMonthProvider,
  hasCachedHolidayMap,
  type HolidayProvider,
} from '../lib/providers/holiday-provider'
import { buildCalendarMonthData } from '../lib/services/calendar-builder'
import type { HolidayMap } from '../lib/types/calendar-holiday-api.types'
import CalendarControls from './components/calendar-controls'
import CalendarGrid from './components/calendar-grid'
import CalendarMonthSummary from './components/calendar-month-summary'
import CalendarWeekdayRow from './components/calendar-weekday-row'

function hasSelectedMonthCache(cursor: dayjs.Dayjs) {
  const year = cursor.year()
  const month = cursor.month() + 1

  return hasCachedHolidayMap({ year, month })
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => dayjs().startOf('month'))
  const [holidayMap, setHolidayMap] = useState<HolidayMap>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false)

  const todayKey = dayjs().format('YYYY-MM-DD')

  useEffect(() => {
    const controller = new AbortController()
    const provider: HolidayProvider = new CalendarMonthProvider()

    const request = provider.getMonth({
      year: cursor.year(),
      month: cursor.month() + 1,
      signal: controller.signal,
    })

    request
      .then(next => {
        if (!controller.signal.aborted) {
          setHolidayMap(next)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setHolidayMap({})
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [cursor])

  const calendar = useMemo(
    () =>
      buildCalendarMonthData({
        year: cursor.year(),
        month: cursor.month() + 1,
        holidayMap,
      }),
    [cursor, holidayMap]
  )

  const yearValue = String(cursor.year())
  const monthValue = String(cursor.month() + 1)

  return (
    <div className={cn('w-full')}>
      <PageHeader
        icon={CalendarDays}
        kicker='Calendar'
        title='음력 달력 및 공휴일 확인'
        description='오늘 음력 날짜와 절기, 공휴일을 한눈에 확인할 수 있는 달력입니다. 양력과 음력을 함께 보고, 기념일과 잡절 정보도 선택해 표시할 수 있습니다.'
      />
      <div className='w-full flex flex-col gap-6'>
        <Card>
          <CalendarControls
            calendarTitle={`${calendar.year}.${String(calendar.month).padStart(2, '0')}`}
            yearValue={yearValue}
            monthValue={monthValue}
            onChangeYear={value => {
              setCursor(prev => {
                const next = prev.year(Number(value)).startOf('month')
                setIsLoading(!hasSelectedMonthCache(next))
                return next
              })
            }}
            onChangeMonth={value => {
              setCursor(prev => {
                const next = prev.month(Number(value) - 1).startOf('month')
                setIsLoading(!hasSelectedMonthCache(next))
                return next
              })
            }}
            onPrevMonth={() => {
              setCursor(prev => {
                const next = prev.subtract(1, 'month')
                setIsLoading(!hasSelectedMonthCache(next))
                return next
              })
            }}
            onToday={() => {
              const next = dayjs().startOf('month')
              setIsLoading(!hasSelectedMonthCache(next))
              setCursor(next)
            }}
            onNextMonth={() => {
              setCursor(prev => {
                const next = prev.add(1, 'month')
                setIsLoading(!hasSelectedMonthCache(next))
                return next
              })
            }}
          />

          <CardContent className='space-y-2'>
            <CalendarWeekdayRow />
            <CalendarGrid
              calendar={calendar}
              todayKey={todayKey}
            />
            <CalendarMonthSummary
              calendar={calendar}
              isCollapsed={isSummaryCollapsed}
              isLoading={isLoading}
              onToggleCollapsed={() => setIsSummaryCollapsed(prev => !prev)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
