'use client'

import dayjs from 'dayjs'
import { CalendarDays, Sparkles } from 'lucide-react'
import { useMemo } from 'react'

import PageHeader from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { BuiltinKrHolidayProvider } from '../lib/providers/holiday-provider'
import { buildCalendarMonthData } from '../lib/services/calendar-builder'

export default function CalendarPage() {
  const today = dayjs()

  const calendar = useMemo(
    () =>
      buildCalendarMonthData({
        year: today.year(),
        month: today.month() + 1,
        holidayProvider: new BuiltinKrHolidayProvider(),
      }),
    [today]
  )

  return (
    <div className='w-full flex flex-col gap-6'>
      <PageHeader
        icon={CalendarDays}
        kicker='Calendar'
        title='양력·음력·절기·공휴일 캘린더 구조'
        description='먼저 구조를 분리해서 만들고, 이후 외부 공휴일 API 연동을 붙일 수 있게 설계했습니다.'
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
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-4 w-4 text-primary' />
            이번 달 미리보기 ({calendar.year}.{String(calendar.month).padStart(2, '0')})
          </CardTitle>
          <CardDescription>각 날짜 셀에 음력/절기/공휴일 정보를 같이 포함합니다.</CardDescription>
        </CardHeader>
        <CardContent className='grid grid-cols-7 gap-2 text-xs sm:text-sm'>
          {calendar.weeks.flatMap(week =>
            week.map(cell => (
              <div
                key={cell.key}
                className='rounded-md border p-2 min-h-24 flex flex-col gap-1 bg-card/60'
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
        </CardContent>
      </Card>
    </div>
  )
}
