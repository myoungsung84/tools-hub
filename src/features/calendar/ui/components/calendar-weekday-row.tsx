const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

function WeekdayLabels() {
  return WEEKDAY_LABELS.map((label, i) => (
    <div
      key={label}
      className={`py-1 ${
        i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-muted-foreground'
      }`}
    >
      {label}
    </div>
  ))
}

export default function CalendarWeekdayRow() {
  return (
    <>
      <div className='grid grid-cols-7 gap-1 text-center text-xs font-medium sm:hidden'>
        <WeekdayLabels />
      </div>
      <div className='hidden overflow-x-auto sm:block'>
        <div className='grid min-w-[720px] grid-cols-7 gap-2 text-center text-xs font-medium'>
          <WeekdayLabels />
        </div>
      </div>
    </>
  )
}
