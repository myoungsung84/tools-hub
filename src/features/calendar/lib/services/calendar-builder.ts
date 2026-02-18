import { getSolarTermsByYear, type SolarTermWithDate,solarToLunar } from '@fullstackfamily/manseryeok'
import dayjs from 'dayjs'

import type { HolidayProvider } from '../providers/holiday-provider'
import type { CalendarDayCell, CalendarMonthData, SolarTermItem } from '../types/calendar.types'

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function toSolarTermMap(year: number) {
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

  return map
}

function toCell(cursor: dayjs.Dayjs, month: number, termMap: Map<string, SolarTermItem>, provider: HolidayProvider) {
  const solarDate = cursor.format('YYYY-MM-DD')

  try {
    const lunar = solarToLunar(cursor.year(), cursor.month() + 1, cursor.date())
    const holidays = provider.getHolidaysByDate({
      solarDate,
      lunarMonth: lunar.lunar.month,
      lunarDay: lunar.lunar.day,
    })

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
      holidays,
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
      holidays: [],
    }
  }
}

export function buildCalendarMonthData(params: {
  year: number
  month: number
  holidayProvider: HolidayProvider
}): CalendarMonthData {
  const base = dayjs(`${params.year}-${String(params.month).padStart(2, '0')}-01`)
  const start = base.startOf('month').startOf('week')
  const termMap = toSolarTermMap(params.year)
  const weeks: CalendarDayCell[][] = []

  let cursor = start
  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week: CalendarDayCell[] = []

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      week.push(toCell(cursor, params.month, termMap, params.holidayProvider))
      cursor = cursor.add(1, 'day')
    }

    weeks.push(week)
  }

  return { year: params.year, month: params.month, weeks }
}
