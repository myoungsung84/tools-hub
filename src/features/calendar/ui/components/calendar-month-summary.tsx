'use client'

import dayjs from 'dayjs'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/shared'

import type { CalendarDayCell, CalendarMonthData } from '../../lib/types/calendar.types'
import type { HolidayKind } from '../../lib/types/calendar-holiday-api.types'
import { getLunarDayNumber, isSonEobsneunByLunarDay } from './calendar-day-cell'

type SummaryEntry = {
  key: string
  date: string
  label: string
}

type SummaryGroup = {
  key: string
  title: string
  countLabel: string
  dotClass: string
  badgeClass: string
  entries: SummaryEntry[]
  canLimit?: boolean
}

type Props = {
  calendar: CalendarMonthData
  isCollapsed: boolean
  isLoading: boolean
  onToggleCollapsed: () => void
}

function formatDate(date: string) {
  return dayjs(date).format('M월 D일')
}

function toHolidayEntries(cells: CalendarDayCell[], kind: HolidayKind) {
  return cells
    .flatMap(cell =>
      cell.holidays
        .filter(holiday => holiday.kind === kind)
        .map(holiday => ({
          key: `${cell.key}-${holiday.kind}-${holiday.name}`,
          date: cell.solarDate,
          label: `${formatDate(cell.solarDate)} ${holiday.name}`,
        }))
    )
    .sort((a, b) => a.date.localeCompare(b.date))
}

function toSonEobsneunEntries(cells: CalendarDayCell[]) {
  return cells
    .filter(cell => isSonEobsneunByLunarDay(getLunarDayNumber(cell)))
    .map(cell => ({
      key: `${cell.key}-son-eobsneun`,
      date: cell.solarDate,
      label: formatDate(cell.solarDate),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function toSolarTermEntries(cells: CalendarDayCell[]) {
  return cells
    .filter(cell => cell.solarTerm)
    .map(cell => ({
      key: `${cell.key}-solar-term`,
      date: cell.solarDate,
      label: `${formatDate(cell.solarDate)} ${cell.solarTerm?.name ?? ''}`.trim(),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function countDays(entries: SummaryEntry[]) {
  return new Set(entries.map(entry => entry.date)).size
}

const CATEGORY_LIMIT = 5

function SummaryColumn({ group }: { group: SummaryGroup }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const canCollapseEntries = group.canLimit && group.entries.length >= CATEGORY_LIMIT + 1
  const visibleEntries =
    canCollapseEntries && !isExpanded ? group.entries.slice(0, CATEGORY_LIMIT) : group.entries
  const hiddenCount = group.entries.length - visibleEntries.length

  return (
    <div className='min-w-0 space-y-2 rounded-md border bg-card/50 p-3'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex min-w-0 items-center gap-2'>
          <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', group.dotClass)} />
          <span className='truncate text-sm font-medium'>{group.title}</span>
        </div>
        <Badge variant='outline' className={cn('shrink-0', group.badgeClass)}>
          {group.countLabel}
        </Badge>
      </div>

      {group.entries.length > 0 ? (
        <div className='space-y-1 text-xs text-muted-foreground'>
          {visibleEntries.map(entry => (
            <div key={entry.key} className='leading-relaxed'>
              {entry.label}
            </div>
          ))}
          {canCollapseEntries && (
            <div className='mt-2 border-t pt-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-7 w-full justify-center px-2 text-xs'
                onClick={() => setIsExpanded(prev => !prev)}
              >
                {isExpanded ? '접기 ▲' : `나머지 ${hiddenCount}건 보기 ▼`}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className='text-xs text-muted-foreground'>해당 항목 없음</div>
      )}
    </div>
  )
}

export default function CalendarMonthSummary({
  calendar,
  isCollapsed,
  isLoading,
  onToggleCollapsed,
}: Props) {
  const cells = calendar.weeks.flatMap(week => week).filter(cell => cell.inCurrentMonth)
  const publicEntries = toHolidayEntries(cells, 'public')
  const sonEobsneunEntries = toSonEobsneunEntries(cells)
  const solarTermEntries = toSolarTermEntries(cells)
  const anniversaryEntries = toHolidayEntries(cells, 'anniversary')
  const sundryEntries = toHolidayEntries(cells, 'sundry')
  const groups: SummaryGroup[] = [
    {
      key: 'public',
      title: '공휴일',
      countLabel: `${countDays(publicEntries)}일`,
      dotClass: 'bg-rose-500',
      badgeClass: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
      entries: publicEntries,
    },
    {
      key: 'son-eobsneun',
      title: '손없는날',
      countLabel: `${sonEobsneunEntries.length}일`,
      dotClass: 'bg-emerald-500',
      badgeClass:
        'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      entries: sonEobsneunEntries,
    },
    {
      key: 'solar-term',
      title: '절기',
      countLabel: `${solarTermEntries.length}일`,
      dotClass: 'bg-amber-500',
      badgeClass: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      entries: solarTermEntries,
    },
    {
      key: 'anniversary',
      title: '기념일',
      countLabel: `${anniversaryEntries.length}건`,
      dotClass: 'bg-blue-500',
      badgeClass: 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400',
      entries: anniversaryEntries,
      canLimit: true,
    },
    {
      key: 'sundry',
      title: '잡절',
      countLabel: `${sundryEntries.length}건`,
      dotClass: 'bg-muted-foreground/60',
      badgeClass: 'border-muted-foreground/20 bg-muted/70 text-muted-foreground',
      entries: sundryEntries,
    },
  ]

  return (
    <section className='space-y-3 pt-2' aria-label='이번 달 요약'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h2 className='text-sm font-semibold'>이번 달 요약</h2>
          <span className='text-xs text-muted-foreground'>
            {calendar.year}.{String(calendar.month).padStart(2, '0')}
          </span>
        </div>
        <Button type='button' variant='ghost' size='sm' onClick={onToggleCollapsed}>
          {isCollapsed ? '펼치기' : '접기'}
        </Button>
      </div>

      {isLoading ? (
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-5'>
          {groups.map(group => (
            <div key={group.key} className='min-w-0 space-y-3 rounded-md border bg-card/50 p-3'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex min-w-0 items-center gap-2'>
                  <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', group.dotClass)} />
                  <span className='text-sm font-medium'>{group.title}</span>
                </div>
                <div className='h-5 w-10 rounded-full bg-muted' />
              </div>
              <div className='space-y-2'>
                <div className='h-3 w-2/3 rounded bg-muted' />
                <div className='h-3 w-1/2 rounded bg-muted' />
              </div>
            </div>
          ))}
        </div>
      ) : isCollapsed ? (
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-5'>
          {groups.map(group => (
            <div key={group.key} className='flex items-center justify-between gap-2 rounded-md border bg-card/50 p-3'>
              <div className='flex min-w-0 items-center gap-2'>
                <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', group.dotClass)} />
                <span className='truncate text-sm font-medium'>{group.title}</span>
              </div>
              <Badge variant='outline' className={cn('shrink-0', group.badgeClass)}>
                {group.countLabel}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-5'>
          {groups.map(group => (
            <SummaryColumn key={group.key} group={group} />
          ))}
        </div>
      )}
    </section>
  )
}
