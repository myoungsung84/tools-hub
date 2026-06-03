'use client'

import dayjs from 'dayjs'
import { CalendarDays } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import PageHeader from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/shared'

import {
  CompositeHolidayProvider,
  ExternalAnniversaryProvider,
  ExternalPublicHolidayProvider,
  ExternalSundryProvider,
  hasCachedHolidayMap,
  type HolidayProvider,
} from '../lib/providers/holiday-provider'
import { buildCalendarMonthData } from '../lib/services/calendar-builder'
import type { HolidayMap } from '../lib/types/calendar-holiday-api.types'
import CalendarControls from './components/calendar-controls'
import CalendarGrid from './components/calendar-grid'
import CalendarMonthSummary from './components/calendar-month-summary'
import CalendarWeekdayRow from './components/calendar-weekday-row'

type VisibilityState = {
  public: boolean
  anniversary: boolean
  sundry: boolean
}

function hasSelectedMonthCache(cursor: dayjs.Dayjs, visibility: VisibilityState) {
  const year = cursor.year()
  const month = cursor.month() + 1

  return (
    (!visibility.public ||
      hasCachedHolidayMap({ path: '/api/calendar/holidays', year, month })) &&
    (!visibility.anniversary ||
      hasCachedHolidayMap({ path: '/api/calendar/anniversaries', year, month })) &&
    (!visibility.sundry ||
      hasCachedHolidayMap({ path: '/api/calendar/sundry', year, month }))
  )
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => dayjs().startOf('month'))
  const [showPublic, setShowPublic] = useState(true)
  const [showAnniversary, setShowAnniversary] = useState(true)
  const [showSundry, setShowSundry] = useState(true)
  const [showSolarTerm, setShowSolarTerm] = useState(true)

  const [showSonEobsneun, setShowSonEobsneun] = useState(true)

  const [holidayMap, setHolidayMap] = useState<HolidayMap>({})
  const [isLoading, setIsLoading] = useState(true)

  const todayKey = dayjs().format('YYYY-MM-DD')
  const visibility = useMemo(
    () => ({ public: showPublic, anniversary: showAnniversary, sundry: showSundry }),
    [showAnniversary, showPublic, showSundry]
  )

  useEffect(() => {
    const providers: HolidayProvider[] = []
    if (showPublic) providers.push(new ExternalPublicHolidayProvider())
    if (showAnniversary) providers.push(new ExternalAnniversaryProvider())
    if (showSundry) providers.push(new ExternalSundryProvider())

    const controller = new AbortController()
    const composite = new CompositeHolidayProvider(providers)

    const request =
      providers.length === 0
        ? Promise.resolve<HolidayMap>({})
        : composite.getMonth({
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
  }, [cursor, showAnniversary, showPublic, showSundry])

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
            isLoading={isLoading}
            showPublic={showPublic}
            showAnniversary={showAnniversary}
            showSundry={showSundry}
            showSonEobsneun={showSonEobsneun}
            showSolarTerm={showSolarTerm}
            onChangeYear={value => {
              setCursor(prev => {
                const next = prev.year(Number(value)).startOf('month')
                setIsLoading(!hasSelectedMonthCache(next, visibility))
                return next
              })
            }}
            onChangeMonth={value => {
              setCursor(prev => {
                const next = prev.month(Number(value) - 1).startOf('month')
                setIsLoading(!hasSelectedMonthCache(next, visibility))
                return next
              })
            }}
            onPrevMonth={() => {
              setCursor(prev => {
                const next = prev.subtract(1, 'month')
                setIsLoading(!hasSelectedMonthCache(next, visibility))
                return next
              })
            }}
            onToday={() => {
              const next = dayjs().startOf('month')
              setIsLoading(!hasSelectedMonthCache(next, visibility))
              setCursor(next)
            }}
            onNextMonth={() => {
              setCursor(prev => {
                const next = prev.add(1, 'month')
                setIsLoading(!hasSelectedMonthCache(next, visibility))
                return next
              })
            }}
            onTogglePublic={checked => {
              setIsLoading(!hasSelectedMonthCache(cursor, { ...visibility, public: checked }))
              setShowPublic(checked)
            }}
            onToggleAnniversary={checked => {
              setIsLoading(!hasSelectedMonthCache(cursor, { ...visibility, anniversary: checked }))
              setShowAnniversary(checked)
            }}
            onToggleSundry={checked => {
              setIsLoading(!hasSelectedMonthCache(cursor, { ...visibility, sundry: checked }))
              setShowSundry(checked)
            }}
            onToggleSonEobsneun={checked => {
              setShowSonEobsneun(checked)
            }}
            onToggleSolarTerm={checked => {
              setShowSolarTerm(checked)
            }}
          />

          <CardContent className='space-y-2'>
            <CalendarWeekdayRow />
            <CalendarGrid
              calendar={calendar}
              isLoading={isLoading}
              todayKey={todayKey}
              showSonEobsneun={showSonEobsneun}
              showSolarTerm={showSolarTerm}
            />
            <CalendarMonthSummary
              calendar={calendar}
              showPublic={showPublic}
              showSonEobsneun={showSonEobsneun}
              showSolarTerm={showSolarTerm}
              showAnniversary={showAnniversary}
              showSundry={showSundry}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
