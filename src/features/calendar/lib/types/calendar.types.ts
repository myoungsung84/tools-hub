export type CalendarSystem = 'solar' | 'lunar'

export type HolidayRuleType = 'fixed-solar' | 'fixed-lunar'

export type HolidaySource = 'builtin' | 'external'

export interface HolidayRule {
  name: string
  type: HolidayRuleType
  month: number
  day: number
  substitute?: boolean
}

export interface CalendarHoliday {
  name: string
  source: HolidaySource
}

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
  holidays: CalendarHoliday[]
}

export interface CalendarMonthData {
  year: number
  month: number
  weeks: CalendarDayCell[][]
}
