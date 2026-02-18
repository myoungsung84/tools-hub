'use client'

import dayjs from 'dayjs'
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import PageHeader from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import {
  CompositeHolidayProvider,
  ExternalAnniversaryProvider,
  ExternalPublicHolidayProvider,
  ExternalSundryProvider,
  type HolidayProvider,
} from '../lib/providers/holiday-provider'
import { buildCalendarMonthData } from '../lib/services/calendar-builder'
import type { HolidayMap } from '../lib/types/calendar-holiday-api.types'

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

const YEAR_MIN = 1950
const YEAR_MAX = 2100

const MONTH_ITEMS = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1
  return { value: String(month), label: String(month).padStart(2, '0') }
})

const YEAR_ITEMS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => {
  const year = YEAR_MIN + i
  return { value: String(year), label: String(year) }
})

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => dayjs().startOf('month'))
  const [showPublic, setShowPublic] = useState(true)
  const [showAnniversary, setShowAnniversary] = useState(true)
  const [showSundry, setShowSundry] = useState(true)
  const [holidayMap, setHolidayMap] = useState<HolidayMap>({})
  const [isLoading, setIsLoading] = useState(true)

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
    <div className='w-full flex flex-col gap-6'>
      <PageHeader
        icon={CalendarDays}
        kicker='Calendar'
        title='양력·음력·절기·공휴일 캘린더'
        description='월 이동과 모바일 대응이 가능한 기본 UX를 먼저 구성했습니다. 외부 API 공휴일/기념일/잡절을 선택적으로 합쳐 표시합니다.'
      />

      <Card>
        <CardHeader>
          <CardTitle>설계 요약</CardTitle>
          <CardDescription>
            1) 날짜 그리드 생성, 2) 음력/절기 enrich, 3) 월 단위 holidayMap 주입으로 렌더링합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          <Badge variant='secondary'>dayjs: month/week grid</Badge>
          <Badge variant='secondary'>manseryeok: solar↔lunar</Badge>
          <Badge variant='secondary'>manseryeok: 24절기</Badge>
          <Badge variant='secondary'>holiday provider: composite merge</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='gap-3'>
          <div className='flex items-center justify-between gap-3'>
            <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <Sparkles className='h-4 w-4 text-primary' />
              {calendar.year}.{String(calendar.month).padStart(2, '0')}
            </CardTitle>

            <div className='flex flex-wrap items-center justify-end gap-2'>
              <div className='flex items-center gap-2'>
                <Select
                  value={yearValue}
                  onValueChange={value => {
                    setIsLoading(true)
                    setCursor(prev => prev.year(Number(value)).startOf('month'))
                  }}
                >
                  <SelectTrigger className='h-9 w-[104px]'>
                    <SelectValue placeholder='년도' />
                  </SelectTrigger>
                  <SelectContent className='max-h-[320px]'>
                    {YEAR_ITEMS.map(item => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={monthValue}
                  onValueChange={value => {
                    setIsLoading(true)
                    setCursor(prev => prev.month(Number(value) - 1).startOf('month'))
                  }}
                >
                  <SelectTrigger className='h-9 w-[88px]'>
                    <SelectValue placeholder='월' />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_ITEMS.map(item => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}월
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center gap-1'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  aria-label='이전 달'
                  onClick={() => {
                    setIsLoading(true)
                    setCursor(prev => prev.subtract(1, 'month'))
                  }}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setIsLoading(true)
                    setCursor(dayjs().startOf('month'))
                  }}
                >
                  오늘
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  aria-label='다음 달'
                  onClick={() => {
                    setIsLoading(true)
                    setCursor(prev => prev.add(1, 'month'))
                  }}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>

          <div className='flex flex-wrap items-center gap-4 text-sm'>
            <label className='flex items-center gap-2'>
              <Switch
                checked={showPublic}
                onCheckedChange={checked => {
                  setIsLoading(true)
                  setShowPublic(checked)
                }}
              />
              <span>공휴일</span>
            </label>
            <label className='flex items-center gap-2'>
              <Switch
                checked={showAnniversary}
                onCheckedChange={checked => {
                  setIsLoading(true)
                  setShowAnniversary(checked)
                }}
              />
              <span>기념일</span>
            </label>
            <label className='flex items-center gap-2'>
              <Switch
                checked={showSundry}
                onCheckedChange={checked => {
                  setIsLoading(true)
                  setShowSundry(checked)
                }}
              />
              <span>잡절</span>
            </label>
            <span className='text-xs text-muted-foreground'>{isLoading ? '불러오는 중…' : '완료'}</span>
          </div>

          <CardDescription>
            모바일에서는 좌우 스크롤이 가능하고, 각 셀에 음력/절기/공휴일을 함께 보여줍니다.
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-2'>
          <div className='grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground sm:gap-2'>
            {WEEKDAY_LABELS.map(label => (
              <div key={label} className='py-1'>
                {label}
              </div>
            ))}
          </div>

          <div className='overflow-x-auto'>
            <div
              className='grid min-w-[720px] grid-cols-7 gap-1 text-xs transition-opacity sm:gap-2 sm:text-sm'
              style={{ opacity: isLoading ? 0.75 : 1 }}
            >
              {calendar.weeks.flatMap(week =>
                week.map(cell => (
                  <div
                    key={cell.key}
                    className='rounded-md border p-2 min-h-24 sm:min-h-28 flex flex-col gap-1 bg-card/60'
                    style={{ opacity: cell.inCurrentMonth ? 1 : 0.45 }}
                  >
                    <div className='font-semibold'>{cell.day}</div>
                    <div className='text-muted-foreground'>{cell.lunar?.label ?? '-'}</div>
                    {cell.solarTerm && <div className='text-blue-500'>{cell.solarTerm.name}</div>}
                    {cell.holidays.map(holiday => (
                      <div key={`${cell.key}-${holiday.name}-${holiday.kind}`} className='text-rose-500'>
                        {holiday.name}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
