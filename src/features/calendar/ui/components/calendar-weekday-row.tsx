const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

export default function CalendarWeekdayRow() {
  return (
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
  )
}
