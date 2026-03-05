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
import { Switch } from '@/components/ui/switch'

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
  isLoading: boolean
  showPublic: boolean
  showAnniversary: boolean
  showSundry: boolean
  showSonEobsneun: boolean
  onChangeYear: (value: string) => void
  onChangeMonth: (value: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  onTogglePublic: (checked: boolean) => void
  onToggleAnniversary: (checked: boolean) => void
  onToggleSundry: (checked: boolean) => void
  onToggleSonEobsneun: (checked: boolean) => void
}

export default function CalendarControls(props: Props) {
  const {
    calendarTitle,
    yearValue,
    monthValue,
    isLoading,
    showPublic,
    showAnniversary,
    showSundry,
    showSonEobsneun,
    onChangeYear,
    onChangeMonth,
    onPrevMonth,
    onNextMonth,
    onToday,
    onTogglePublic,
    onToggleAnniversary,
    onToggleSundry,
    onToggleSonEobsneun,
  } = props

  return (
    <CardHeader className='gap-3'>
      <div className='flex items-center justify-between gap-3'>
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

      <div className='flex flex-wrap items-center gap-4 text-sm'>
        <label className='flex items-center gap-2'>
          <Switch checked={showPublic} onCheckedChange={onTogglePublic} />
          <span className='flex items-center gap-1.5'>
            <span className='inline-block h-2 w-2 rounded-full bg-rose-500' />
            공휴일
          </span>
        </label>

        <label className='flex items-center gap-2'>
          <Switch checked={showAnniversary} onCheckedChange={onToggleAnniversary} />
          <span className='flex items-center gap-1.5'>
            <span className='inline-block h-2 w-2 rounded-full bg-amber-500' />
            기념일
          </span>
        </label>

        <label className='flex items-center gap-2'>
          <Switch checked={showSundry} onCheckedChange={onToggleSundry} />
          <span className='flex items-center gap-1.5'>
            <span className='inline-block h-2 w-2 rounded-full bg-muted-foreground/60' />
            잡절
          </span>
        </label>

        <label className='flex items-center gap-2'>
          <Switch checked={showSonEobsneun} onCheckedChange={onToggleSonEobsneun} />
          <span className='flex items-center gap-1.5'>
            <span className='inline-block h-2 w-2 rounded-full bg-emerald-500' />
            손없는날
          </span>
        </label>

        <span className='text-xs text-muted-foreground'>{isLoading ? '불러오는 중…' : '완료'}</span>
      </div>
    </CardHeader>
  )
}
