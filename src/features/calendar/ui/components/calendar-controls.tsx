import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const YEAR_MIN = 2000
const YEAR_MAX = 2100

const MONTH_ITEMS = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1
  return { value: String(month), label: String(month).padStart(2, '0') }
})

const YEAR_ITEMS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => {
  const year = YEAR_MIN + i
  return { value: String(year), label: String(year) }
})

type Props = {
  calendarTitle: string
  yearValue: string
  monthValue: string
  onChangeYear: (value: string) => void
  onChangeMonth: (value: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export default function CalendarControls(props: Props) {
  const {
    calendarTitle,
    yearValue,
    monthValue,
    onChangeYear,
    onChangeMonth,
    onPrevMonth,
    onNextMonth,
    onToday,
  } = props

  return (
    <CardHeader className='gap-2 pb-3'>
      <div className='hidden items-center justify-between gap-3 sm:flex'>
        <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
          <Sparkles className='h-4 w-4 text-primary' />
          {calendarTitle}
        </CardTitle>

        <div className='flex flex-wrap items-center justify-end gap-2'>
          <div className='flex items-center gap-2'>
            <Select value={yearValue} onValueChange={onChangeYear}>
              <SelectTrigger className='h-9 w-[104px]'>
                <SelectValue placeholder='년도' />
              </SelectTrigger>
              <SelectContent className='max-h-[320px]'>
                {YEAR_ITEMS.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={monthValue} onValueChange={onChangeMonth}>
              <SelectTrigger className='h-9 w-[88px]'>
                <SelectValue placeholder='월' />
              </SelectTrigger>
              <SelectContent>
                {MONTH_ITEMS.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}월
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-1'>
            <Button
              type='button'
              variant='outline'
              size='icon'
              aria-label='이전 달'
              onClick={onPrevMonth}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>

            <Button type='button' variant='secondary' size='sm' onClick={onToday}>
              오늘
            </Button>

            <Button
              type='button'
              variant='outline'
              size='icon'
              aria-label='다음 달'
              onClick={onNextMonth}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between gap-2 sm:hidden'>
        <Button type='button' variant='outline' size='icon' aria-label='이전 달' onClick={onPrevMonth}>
          <ChevronLeft className='h-4 w-4' />
        </Button>

        <CardTitle className='flex min-w-0 flex-1 items-center justify-center gap-1.5 text-base'>
          <Sparkles className='h-4 w-4 shrink-0 text-primary' />
          <span className='truncate'>{calendarTitle}</span>
        </CardTitle>

        <Button type='button' variant='secondary' size='sm' onClick={onToday}>
          오늘
        </Button>

        <Button type='button' variant='outline' size='icon' aria-label='다음 달' onClick={onNextMonth}>
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>

    </CardHeader>
  )
}
