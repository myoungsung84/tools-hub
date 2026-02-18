'use client'

import dayjs from 'dayjs'
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'

import PageHeader from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { BuiltinKrHolidayProvider } from '../lib/providers/holiday-provider'
import { buildCalendarMonthData } from '../lib/services/calendar-builder'

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => dayjs().startOf('month'))

  const calendar = useMemo(
    () =>
      buildCalendarMonthData({
        year: cursor.year(),
        month: cursor.month() + 1,
        holidayProvider: new BuiltinKrHolidayProvider(),
      }),
    [cursor]
  )

  return (
    <div className='w-full flex flex-col gap-6'>
      <PageHeader
        icon={CalendarDays}
        kicker='Calendar'
        title='양력·음력·절기·공휴일 캘린더'
        description='월 이동과 모바일 대응이 가능한 기본 UX를 먼저 구성했습니다. 이후 외부 공휴일 API를 연결할 수 있습니다.'
      />

      <Card>
        <CardHeader>
          <CardTitle>설계 요약</CardTitle>
          <CardDescription>
            1) 날짜 그리드 생성, 2) 음력/절기 enrich, 3) 공휴일 provider 주입 순서로 확장합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          <Badge variant='secondary'>dayjs: month/week grid</Badge>
          <Badge variant='secondary'>manseryeok: solar↔lunar</Badge>
          <Badge variant='secondary'>manseryeok: 24절기</Badge>
          <Badge variant='secondary'>holiday provider: built-in + external</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='gap-3'>
          <div className='flex items-center justify-between gap-2'>
            <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <Sparkles className='h-4 w-4 text-primary' />
              {calendar.year}.{String(calendar.month).padStart(2, '0')}
            </CardTitle>

            <div className='flex items-center gap-1'>
              <Button
                type='button'
                variant='outline'
                size='icon'
                aria-label='이전 달'
                onClick={() => setCursor(prev => prev.subtract(1, 'month'))}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setCursor(dayjs().startOf('month'))}
              >
                오늘
              </Button>
              <Button
                type='button'
                variant='outline'
                size='icon'
                aria-label='다음 달'
                onClick={() => setCursor(prev => prev.add(1, 'month'))}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <CardDescription>모바일에서는 좌우 스크롤이 가능하고, 각 셀에 음력/절기/공휴일을 함께 보여줍니다.</CardDescription>
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
            <div className='grid min-w-[720px] grid-cols-7 gap-1 text-xs sm:gap-2 sm:text-sm'>
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
                      <div key={`${cell.key}-${holiday.name}`} className='text-rose-500'>
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
