'use client'

import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/shared'

import type { CalendarMonthData } from '../../lib/types/calendar.types'
import type { HolidayKind } from '../../lib/types/calendar-holiday-api.types'
import CalendarDayCell, {
  getHolidayBadgeClass,
  getLunarDayNumber,
  isSonEobsneunByLunarDay,
} from './calendar-day-cell'

type Props = {
  calendar: CalendarMonthData
  todayKey: string
}

function getDotClass(kind: HolidayKind | 'solarTerm' | 'sonEobsneun') {
  switch (kind) {
    case 'public':
      return 'bg-rose-500'
    case 'anniversary':
      return 'bg-blue-500'
    case 'sundry':
      return 'bg-muted-foreground/60'
    case 'solarTerm':
      return 'bg-amber-500'
    case 'sonEobsneun':
      return 'bg-emerald-500'
  }
}

export default function CalendarGrid({
  calendar,
  todayKey,
}: Props) {
  const cells = useMemo(() => calendar.weeks.flatMap(week => week), [calendar.weeks])
  const [manualSelectedKey, setManualSelectedKey] = useState<string | null>(null)
  const defaultSelectedKey = useMemo(() => {
    const todayCell = cells.find(cell => cell.key === todayKey && cell.inCurrentMonth)
    const firstCurrentMonthCell = cells.find(cell => cell.inCurrentMonth)

    return (todayCell ?? firstCurrentMonthCell ?? cells[0])?.key ?? todayKey
  }, [cells, todayKey])
  const selectedKey = manualSelectedKey && cells.some(cell => cell.key === manualSelectedKey)
    ? manualSelectedKey
    : defaultSelectedKey
  const selectedCell = cells.find(cell => cell.key === selectedKey) ?? cells.find(cell => cell.inCurrentMonth)

  return (
    <div className='space-y-3' data-testid='calendar-grid'>
      <div className='relative hidden overflow-x-auto sm:block'>
        <div className='grid min-w-[720px] grid-cols-7 gap-2 text-sm'>
          {calendar.weeks.flatMap((week, _wi) =>
            week.map((cell, di) => {
              const colIndex = di % 7

              return (
                <CalendarDayCell
                  key={cell.key}
                  cell={cell}
                  colIndex={colIndex}
                  todayKey={todayKey}
                />
              )
            })
          )}
        </div>
      </div>

      <div className='space-y-3 sm:hidden'>
        <div className='grid grid-cols-7 gap-1'>
          {cells.map(cell => {
            const isSelected = selectedCell?.key === cell.key
            const isToday = cell.key === todayKey
            const isSonEobsneun = isSonEobsneunByLunarDay(getLunarDayNumber(cell))
            const dots: Array<HolidayKind | 'solarTerm' | 'sonEobsneun'> = [
              ...(cell.holidays.some(holiday => holiday.kind === 'public') ? ['public' as const] : []),
              ...(isSonEobsneun ? ['sonEobsneun' as const] : []),
              ...(cell.solarTerm ? ['solarTerm' as const] : []),
              ...(cell.holidays.some(holiday => holiday.kind === 'anniversary')
                ? ['anniversary' as const]
                : []),
              ...(cell.holidays.some(holiday => holiday.kind === 'sundry') ? ['sundry' as const] : []),
            ].slice(0, 4)

            return (
              <button
                key={cell.key}
                type='button'
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-md border bg-card/60 px-1 py-1.5 text-xs',
                  !cell.inCurrentMonth && 'bg-muted/20 text-muted-foreground/45',
                  isToday && 'border-sky-500/70 text-sky-600 dark:text-sky-400',
                  isSelected && 'ring-2 ring-primary/40'
                )}
                aria-pressed={isSelected}
                aria-label={`${cell.solarDate} 상세 보기`}
                onClick={() => setManualSelectedKey(cell.key)}
              >
                <span
                  className={cn(
                    'font-semibold leading-none',
                    isToday && 'rounded-full border border-sky-500/40 px-1.5 py-1 text-sky-600 dark:text-sky-400'
                  )}
                >
                  {cell.day}
                </span>
                <span className='flex h-2 items-center justify-center gap-0.5'>
                  {dots.map(dot => (
                    <span key={dot} className={cn('h-1.5 w-1.5 rounded-full', getDotClass(dot))} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>

        {selectedCell && (
          <div className='rounded-md border bg-card/70 p-3 shadow-sm'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <div className='text-sm font-semibold'>{selectedCell.solarDate}</div>
                <div className='text-xs text-muted-foreground'>
                  음력 {selectedCell.lunar?.label ?? '-'}
                </div>
              </div>
              {selectedCell.key === todayKey && (
                <Badge
                  variant='outline'
                  className='border-sky-500/30 bg-transparent text-sky-600 dark:text-sky-400'
                >
                  오늘
                </Badge>
              )}
            </div>

            <div className='mt-3 flex flex-wrap gap-1.5'>
              {isSonEobsneunByLunarDay(getLunarDayNumber(selectedCell)) && (
                <Badge
                  variant='outline'
                  className='border-emerald-500/25 bg-emerald-500/10 text-emerald-600'
                >
                  손없는날
                </Badge>
              )}
              {selectedCell.solarTerm && (
                <Badge
                  variant='outline'
                  className='border-amber-500/25 bg-amber-500/10 text-amber-600'
                >
                  {selectedCell.solarTerm.name}
                </Badge>
              )}
              {selectedCell.holidays.map(holiday => (
                <Badge
                  key={`${selectedCell.key}-${holiday.name}-${holiday.kind}`}
                  variant='outline'
                  className={getHolidayBadgeClass(holiday.kind)}
                >
                  {holiday.name}
                </Badge>
              ))}
              {!selectedCell.solarTerm &&
                selectedCell.holidays.length === 0 &&
                !isSonEobsneunByLunarDay(getLunarDayNumber(selectedCell)) && (
                  <span className='text-xs text-muted-foreground'>표시할 일정이 없습니다.</span>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
