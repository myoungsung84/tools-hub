export type HolidayKind = 'public' | 'anniversary' | 'sundry'

export type HolidayItem = {
  date: string
  name: string
  source: 'external' | 'builtin'
  isHoliday: boolean
  kind: HolidayKind
}

export type HolidayMap = Record<string, HolidayItem[]>

export type CalendarHolidaysApiResponse = {
  year: number
  month: number
  holidays: HolidayMap
  fetchedAt: string
}

export type CalendarMonthSourceStatus = 'success' | 'failed'

export type CalendarMonthApiResponse = {
  year: number
  month: number
  holidays: HolidayMap
  fetchedAt: string
  meta: {
    cached: boolean
    generatedAt: string
    sources: {
      holidays: CalendarMonthSourceStatus
      anniversaries: CalendarMonthSourceStatus
      sundry: CalendarMonthSourceStatus
    }
  }
}
