'use client'

import dayjs from 'dayjs'
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import PageHeader from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import type { CalendarDayCell } from '../lib/types/calendar.types'
import type { HolidayKind, HolidayMap } from '../lib/types/calendar-holiday-api.types'

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

const YEAR_MIN = 2000
const YEAR_MAX = 2100

const MONTH_ITEMS = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1
  return { value: String(month), label: String(month).padStart(2, '0') }
})

const YEAR_ITEMS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => {
  const year = YEAR_MIN + i
  return { value: String(year), label: String(year) }
})

function getDayNumberClass(colIndex: number, inCurrentMonth: boolean) {
  if (!inCurrentMonth) return 'text-muted-foreground/40'
  if (colIndex === 0) return 'text-rose-500'
  if (colIndex === 6) return 'text-blue-500'
  return ''
}

function getCellBgClass(cell: CalendarDayCell, colIndex: number) {
  if (!cell.inCurrentMonth) return 'bg-muted/20'
  const hasHoliday = cell.holidays.some(h => h.isHoliday)
  if (hasHoliday) return 'bg-rose-500/5'
  if (colIndex === 0) return 'bg-rose-500/[0.03]'
  if (colIndex === 6) return 'bg-blue-500/[0.03]'
  return 'bg-card/60'
}

function getHolidayClass(kind: HolidayKind) {
  switch (kind) {
    case 'public':
      return 'text-rose-500 font-medium'
    case 'anniversary':
      return 'text-amber-500'
    case 'sundry':
      return 'text-muted-foreground'
  }
}

function isTodayCell(cell: CalendarDayCell, todayKey: string) {
  return cell.key === todayKey
}

function getLunarDayNumber(cell: CalendarDayCell): number | null {
  const lunar = cell.lunar
  if (!lunar) return null

  const day = lunar.day
  if (day >= 1 && day <= 30) return day

  return null
}

function isSonEobsneunByLunarDay(lunarDay: number | null) {
  if (!lunarDay) return false
  const mod = lunarDay % 10
  return mod === 9 || mod === 0
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => dayjs().startOf('month'))
  const [showPublic, setShowPublic] = useState(true)
  const [showAnniversary, setShowAnniversary] = useState(true)
  const [showSundry, setShowSundry] = useState(true)

  const [showSonEobsneun, setShowSonEobsneun] = useState(true)

  const [holidayMap, setHolidayMap] = useState<HolidayMap>({})
  const [isLoading, setIsLoading] = useState(true)

  const todayKey = dayjs().format('YYYY-MM-DD')

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
        title='음력 달력 및 공휴일 확인'
        description='오늘 음력 날짜와 절기, 공휴일을 한눈에 확인할 수 있는 달력입니다. 양력과 음력을 함께 보고, 기념일과 잡절 정보도 선택해 표시할 수 있습니다.'
      />

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
                  variant='secondary'
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
              <span className='flex items-center gap-1.5'>
                <span className='inline-block h-2 w-2 rounded-full bg-rose-500' />
                공휴일
              </span>
            </label>

            <label className='flex items-center gap-2'>
              <Switch
                checked={showAnniversary}
                onCheckedChange={checked => {
                  setIsLoading(true)
                  setShowAnniversary(checked)
                }}
              />
              <span className='flex items-center gap-1.5'>
                <span className='inline-block h-2 w-2 rounded-full bg-amber-500' />
                기념일
              </span>
            </label>

            <label className='flex items-center gap-2'>
              <Switch
                checked={showSundry}
                onCheckedChange={checked => {
                  setIsLoading(true)
                  setShowSundry(checked)
                }}
              />
              <span className='flex items-center gap-1.5'>
                <span className='inline-block h-2 w-2 rounded-full bg-muted-foreground/60' />
                잡절
              </span>
            </label>

            <label className='flex items-center gap-2'>
              <Switch
                checked={showSonEobsneun}
                onCheckedChange={checked => {
                  setShowSonEobsneun(checked)
                }}
              />
              <span className='flex items-center gap-1.5'>
                <span className='inline-block h-2 w-2 rounded-full bg-emerald-500' />
                손없는날
              </span>
            </label>

            <span className='text-xs text-muted-foreground'>
              {isLoading ? '불러오는 중…' : '완료'}
            </span>
          </div>
        </CardHeader>

        <CardContent className='space-y-2'>
          <div className='grid grid-cols-7 gap-1 text-center text-xs font-medium sm:gap-2'>
            {WEEKDAY_LABELS.map((label, i) => (
              <div
                key={label}
                className={`py-1 ${
                  i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-muted-foreground'
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          <div className='overflow-x-auto'>
            <div
              className='grid min-w-[720px] grid-cols-7 gap-1 text-xs transition-opacity sm:gap-2 sm:text-sm'
              style={{ opacity: isLoading ? 0.75 : 1 }}
            >
              {calendar.weeks.flatMap((week, _wi) =>
                week.map((cell, di) => {
                  const colIndex = di % 7
                  const isToday = isTodayCell(cell, todayKey)

                  const lunarDayNumber = getLunarDayNumber(cell)
                  const isSonEobsneun = showSonEobsneun && isSonEobsneunByLunarDay(lunarDayNumber)

                  return (
                    <div
                      key={cell.key}
                      className={`rounded-md border p-2 min-h-24 sm:min-h-28 flex flex-col gap-1 ${getCellBgClass(
                        cell,
                        colIndex
                      )}`}
                      style={{ opacity: cell.inCurrentMonth ? 1 : 0.45 }}
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <div
                          className={`font-semibold ${getDayNumberClass(colIndex, cell.inCurrentMonth)}`}
                        >
                          {cell.day}
                        </div>

                        <div className='flex items-center gap-1'>
                          {isSonEobsneun && (
                            <span className='text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium'>
                              손없
                            </span>
                          )}

                          {isToday && (
                            <span className='text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium'>
                              오늘
                            </span>
                          )}
                        </div>
                      </div>

                      <div className='text-muted-foreground/90 font-medium flex items-center gap-2'>
                        <span>{cell.lunar?.label ?? '-'}</span>
                      </div>

                      {cell.solarTerm && <div className='text-blue-500'>{cell.solarTerm.name}</div>}

                      {cell.holidays.map(holiday => (
                        <div
                          key={`${cell.key}-${holiday.name}-${holiday.kind}`}
                          className={getHolidayClass(holiday.kind)}
                        >
                          {holiday.name}
                        </div>
                      ))}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
