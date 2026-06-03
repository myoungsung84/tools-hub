import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/shared'

import type { CalendarDayCell } from '../../lib/types/calendar.types'
import type { HolidayKind } from '../../lib/types/calendar-holiday-api.types'

function getDayNumberClass(colIndex: number, inCurrentMonth: boolean) {
  if (!inCurrentMonth) return 'text-muted-foreground/40'
  if (colIndex === 0) return 'text-rose-500'
  if (colIndex === 6) return 'text-blue-500'
  return ''
}

function getCellBgClass(cell: CalendarDayCell, colIndex: number, isToday: boolean) {
  if (!cell.inCurrentMonth) return 'bg-muted/20'
  const hasHoliday = cell.holidays.some(h => h.isHoliday)
  if (hasHoliday) return cn('bg-rose-500/5', isToday ? 'border-sky-500/70' : 'border-rose-300/60')
  if (isToday) return 'border-sky-500/70 bg-card/60'
  if (colIndex === 0) return 'bg-rose-500/[0.03]'
  if (colIndex === 6) return 'bg-blue-500/[0.03]'
  return 'bg-card/60'
}

export function getHolidayBadgeClass(kind: HolidayKind) {
  switch (kind) {
    case 'public':
      return 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
    case 'anniversary':
      return 'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400'
    case 'sundry':
      return 'border-muted-foreground/20 bg-muted/70 text-muted-foreground'
  }
}

function isTodayCell(cell: CalendarDayCell, todayKey: string) {
  return cell.key === todayKey
}

export function getLunarDayNumber(cell: CalendarDayCell): number | null {
  const lunar = cell.lunar
  if (!lunar) return null

  const day = lunar.day
  if (day >= 1 && day <= 30) return day

  return null
}

export function isSonEobsneunByLunarDay(lunarDay: number | null) {
  if (!lunarDay) return false
  const mod = lunarDay % 10
  return mod === 9 || mod === 0
}

type Props = {
  cell: CalendarDayCell
  colIndex: number
  todayKey: string
  showSonEobsneun: boolean
  showSolarTerm: boolean
}

export default function CalendarDayCell({
  cell,
  colIndex,
  todayKey,
  showSonEobsneun,
  showSolarTerm,
}: Props) {
  const isToday = isTodayCell(cell, todayKey)

  const lunarDayNumber = getLunarDayNumber(cell)
  const isSonEobsneun = showSonEobsneun && isSonEobsneunByLunarDay(lunarDayNumber)
  const hasPublicHoliday = cell.holidays.some(holiday => holiday.kind === 'public' && holiday.isHoliday)

  return (
    <div
      className={cn(
        'flex min-h-24 flex-col gap-1 rounded-md border p-2 sm:min-h-28',
        getCellBgClass(cell, colIndex, isToday)
      )}
      style={{ opacity: cell.inCurrentMonth ? 1 : 0.45 }}
    >
      <div className='flex items-start justify-between gap-2'>
        <div
          className={cn(
            'font-semibold',
            getDayNumberClass(colIndex, cell.inCurrentMonth),
            isToday && 'text-sky-600 dark:text-sky-400'
          )}
        >
          {cell.day}
        </div>

        <div className='flex flex-wrap items-center justify-end gap-1'>
          {isToday && (
            <Badge
              variant='outline'
              className='border-sky-500/30 bg-transparent px-1.5 py-0 text-[10px] leading-4 text-sky-600 dark:text-sky-400'
            >
              오늘
            </Badge>
          )}

          {hasPublicHoliday && (
            <Badge
              variant='outline'
              className='border-rose-500/30 bg-rose-500/10 px-1.5 py-0 text-[10px] leading-4 text-rose-600 dark:text-rose-400'
            >
              공휴
            </Badge>
          )}

          {isSonEobsneun && (
            <Badge
              variant='outline'
              className='border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0 text-[10px] leading-4 text-emerald-600 dark:text-emerald-400'
            >
              손없
            </Badge>
          )}
        </div>
      </div>

      <div className='text-muted-foreground/90 font-medium flex items-center gap-2'>
        <span>{cell.lunar?.label ?? '-'}</span>
      </div>

      {showSolarTerm && cell.solarTerm && (
        <Badge
          variant='outline'
          className='border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400'
        >
          {cell.solarTerm.name}
        </Badge>
      )}

      {cell.holidays.map(holiday => (
        <Badge
          key={`${cell.key}-${holiday.name}-${holiday.kind}`}
          variant='outline'
          className={cn('justify-start', getHolidayBadgeClass(holiday.kind))}
        >
          {holiday.name}
        </Badge>
      ))}
    </div>
  )
}
