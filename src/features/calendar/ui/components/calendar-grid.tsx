import type { CalendarMonthData } from '../../lib/types/calendar.types'
import CalendarDayCell from './calendar-day-cell'

type Props = {
  calendar: CalendarMonthData
  isLoading: boolean
  todayKey: string
  showSonEobsneun: boolean
}

export default function CalendarGrid({ calendar, isLoading, todayKey, showSonEobsneun }: Props) {
  return (
    <div className='overflow-x-auto'>
      <div
        className='grid min-w-[720px] grid-cols-7 gap-1 text-xs transition-opacity sm:gap-2 sm:text-sm'
        style={{ opacity: isLoading ? 0.75 : 1 }}
      >
        {calendar.weeks.flatMap((week, _wi) =>
          week.map((cell, di) => {
            const colIndex = di % 7

            return (
              <CalendarDayCell
                key={cell.key}
                cell={cell}
                colIndex={colIndex}
                todayKey={todayKey}
                showSonEobsneun={showSonEobsneun}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
