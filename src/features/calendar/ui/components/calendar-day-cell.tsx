import type { CalendarDayCell } from '../../lib/types/calendar.types'
import type { HolidayKind } from '../../lib/types/calendar-holiday-api.types'

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

type Props = {
  cell: CalendarDayCell
  colIndex: number
  todayKey: string
  showSonEobsneun: boolean
}

export default function CalendarDayCell({ cell, colIndex, todayKey, showSonEobsneun }: Props) {
  const isToday = isTodayCell(cell, todayKey)

  const lunarDayNumber = getLunarDayNumber(cell)
  const isSonEobsneun = showSonEobsneun && isSonEobsneunByLunarDay(lunarDayNumber)

  return (
    <div
      className={`rounded-md border p-2 min-h-24 sm:min-h-28 flex flex-col gap-1 ${getCellBgClass(
        cell,
        colIndex
      )}`}
      style={{ opacity: cell.inCurrentMonth ? 1 : 0.45 }}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className={`font-semibold ${getDayNumberClass(colIndex, cell.inCurrentMonth)}`}>
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
        <div key={`${cell.key}-${holiday.name}-${holiday.kind}`} className={getHolidayClass(holiday.kind)}>
          {holiday.name}
        </div>
      ))}
    </div>
  )
}
