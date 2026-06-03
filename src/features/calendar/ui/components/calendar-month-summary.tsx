'use client'

import dayjs from 'dayjs'

import { Badge } from '@/components/ui/badge'
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
}

type Props = {
  calendar: CalendarMonthData
  showPublic: boolean
  showSonEobsneun: boolean
  showSolarTerm: boolean
  showAnniversary: boolean
  showSundry: boolean
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

function SummaryColumn({ group }: { group: SummaryGroup }) {
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
          {group.entries.map(entry => (
            <div key={entry.key} className='leading-relaxed'>
              {entry.label}
            </div>
          ))}
        </div>
      ) : (
        <div className='text-xs text-muted-foreground'>해당 항목 없음</div>
      )}
    </div>
  )
}

export default function CalendarMonthSummary({
  calendar,
  showPublic,
  showSonEobsneun,
  showSolarTerm,
  showAnniversary,
  showSundry,
}: Props) {
  const cells = calendar.weeks.flatMap(week => week).filter(cell => cell.inCurrentMonth)
  const publicEntries = toHolidayEntries(cells, 'public')
  const sonEobsneunEntries = toSonEobsneunEntries(cells)
  const solarTermEntries = toSolarTermEntries(cells)
  const anniversaryEntries = toHolidayEntries(cells, 'anniversary')
  const sundryEntries = toHolidayEntries(cells, 'sundry')
  const groups: SummaryGroup[] = [
    ...(showPublic
      ? [
          {
            key: 'public',
            title: '공휴일',
            countLabel: `${countDays(publicEntries)}일`,
            dotClass: 'bg-rose-500',
            badgeClass: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
            entries: publicEntries,
          },
        ]
      : []),
    ...(showSonEobsneun
      ? [
          {
            key: 'son-eobsneun',
            title: '손없는날',
            countLabel: `${sonEobsneunEntries.length}일`,
            dotClass: 'bg-emerald-500',
            badgeClass:
              'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            entries: sonEobsneunEntries,
          },
        ]
      : []),
    ...(showSolarTerm
      ? [
          {
            key: 'solar-term',
            title: '절기',
            countLabel: `${solarTermEntries.length}일`,
            dotClass: 'bg-amber-500',
            badgeClass: 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
            entries: solarTermEntries,
          },
        ]
      : []),
    ...(showAnniversary
      ? [
          {
            key: 'anniversary',
            title: '기념일',
            countLabel: `${anniversaryEntries.length}건`,
            dotClass: 'bg-blue-500',
            badgeClass: 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400',
            entries: anniversaryEntries,
          },
        ]
      : []),
    ...(showSundry
      ? [
          {
            key: 'sundry',
            title: '잡절',
            countLabel: `${sundryEntries.length}건`,
            dotClass: 'bg-muted-foreground/60',
            badgeClass: 'border-muted-foreground/20 bg-muted/70 text-muted-foreground',
            entries: sundryEntries,
          },
        ]
      : []),
  ]

  return (
    <section className='space-y-3 pt-2' aria-label='이번 달 요약'>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='text-sm font-semibold'>이번 달 요약</h2>
        <span className='text-xs text-muted-foreground'>
          {calendar.year}.{String(calendar.month).padStart(2, '0')}
        </span>
      </div>
      {groups.length > 0 ? (
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-5'>
          {groups.map(group => (
            <SummaryColumn key={group.key} group={group} />
          ))}
        </div>
      ) : (
        <div className='rounded-md border bg-card/50 p-3 text-xs text-muted-foreground'>
          표시할 카테고리가 없습니다.
        </div>
      )}
    </section>
  )
}
