import type { HolidayItem } from './calendar-holiday-api.types'

export type CalendarSystem = 'solar' | 'lunar'

export interface SolarTermItem {
  name: string
  month: number
  day: number
  hour: number
  minute: number
}

export interface LunarDateInfo {
  year: number
  month: number
  day: number
  isLeapMonth: boolean
  label: string
}

export interface CalendarDayCell {
  key: string
  solarDate: string
  day: number
  inCurrentMonth: boolean
  lunar: LunarDateInfo | null
  solarTerm: SolarTermItem | null
  holidays: HolidayItem[]
}

export interface CalendarMonthData {
  year: number
  month: number
  weeks: CalendarDayCell[][]
}
