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
