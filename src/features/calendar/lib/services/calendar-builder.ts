import { getSolarTermsByYear, type SolarTermWithDate, solarToLunar } from '@fullstackfamily/manseryeok'
import dayjs from 'dayjs'

import type { CalendarDayCell, CalendarMonthData, SolarTermItem } from '../types/calendar.types'
import type { HolidayItem, HolidayMap } from '../types/calendar-holiday-api.types'

const solarTermMapCache = new Map<number, Map<string, SolarTermItem>>()

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function toSolarTermMap(year: number) {
  if (year < 2020 || year > 2030) {
    return new Map<string, SolarTermItem>()
  }

  const cached = solarTermMapCache.get(year)
  if (cached) return cached

  const items = getSolarTermsByYear(year)
  const map = new Map<string, SolarTermItem>()

  items.forEach((item: SolarTermWithDate) => {
    const key = formatDateKey(item.year, item.month, item.day)

    map.set(key, {
      name: item.name,
      month: item.month,
      day: item.day,
      hour: item.hour,
      minute: item.minute,
    })
  })

  solarTermMapCache.set(year, map)

  return map
}

function sortHolidays(items: HolidayItem[]) {
  const priority: Record<HolidayItem['kind'], number> = {
    public: 0,
    anniversary: 1,
    sundry: 2,
  }

  return [...items].sort((a, b) => priority[a.kind] - priority[b.kind])
}

function toCell(
  cursor: dayjs.Dayjs,
  month: number,
  termMap: Map<string, SolarTermItem>,
  holidayMap: HolidayMap
) {
  const solarDate = cursor.format('YYYY-MM-DD')

  try {
    const lunar = solarToLunar(cursor.year(), cursor.month() + 1, cursor.date())

    const dayCell: CalendarDayCell = {
      key: solarDate,
      solarDate,
      day: cursor.date(),
      inCurrentMonth: cursor.month() + 1 === month,
      lunar: {
        year: lunar.lunar.year,
        month: lunar.lunar.month,
        day: lunar.lunar.day,
        isLeapMonth: lunar.lunar.isLeapMonth,
        label: `${lunar.lunar.isLeapMonth ? '윤' : ''}${lunar.lunar.month}.${lunar.lunar.day}`,
      },
      solarTerm: termMap.get(solarDate) ?? null,
      holidays: sortHolidays(holidayMap[solarDate] ?? []),
    }

    return dayCell
  } catch {
    return {
      key: solarDate,
      solarDate,
      day: cursor.date(),
      inCurrentMonth: cursor.month() + 1 === month,
      lunar: null,
      solarTerm: termMap.get(solarDate) ?? null,
      holidays: sortHolidays(holidayMap[solarDate] ?? []),
    }
  }
}

export function buildCalendarMonthData(params: {
  year: number
  month: number
  holidayMap: HolidayMap
}): CalendarMonthData {
  const base = dayjs(`${params.year}-${String(params.month).padStart(2, '0')}-01`)
  const start = base.startOf('month').startOf('week')
  const termMap = toSolarTermMap(params.year)
  const weeks: CalendarDayCell[][] = []

  let cursor = start
  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week: CalendarDayCell[] = []

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      week.push(toCell(cursor, params.month, termMap, params.holidayMap))
      cursor = cursor.add(1, 'day')
    }

    weeks.push(week)
  }

  return { year: params.year, month: params.month, weeks }
}
