import dayjs from 'dayjs'

import type { CalendarHoliday, HolidayRule } from '../types/calendar.types'

const BUILTIN_KR_HOLIDAYS: HolidayRule[] = [
  { name: '신정', type: 'fixed-solar', month: 1, day: 1 },
  { name: '삼일절', type: 'fixed-solar', month: 3, day: 1 },
  { name: '어린이날', type: 'fixed-solar', month: 5, day: 5, substitute: true },
  { name: '현충일', type: 'fixed-solar', month: 6, day: 6 },
  { name: '광복절', type: 'fixed-solar', month: 8, day: 15 },
  { name: '개천절', type: 'fixed-solar', month: 10, day: 3 },
  { name: '한글날', type: 'fixed-solar', month: 10, day: 9 },
  { name: '성탄절', type: 'fixed-solar', month: 12, day: 25 },
  { name: '설날', type: 'fixed-lunar', month: 1, day: 1 },
  { name: '부처님오신날', type: 'fixed-lunar', month: 4, day: 8 },
  { name: '추석', type: 'fixed-lunar', month: 8, day: 15 },
]

export interface HolidayProvider {
  getHolidaysByDate(params: { solarDate: string; lunarMonth?: number; lunarDay?: number }): CalendarHoliday[]
}

export class BuiltinKrHolidayProvider implements HolidayProvider {
  getHolidaysByDate(params: {
    solarDate: string
    lunarMonth?: number
    lunarDay?: number
  }): CalendarHoliday[] {
    const solar = dayjs(params.solarDate)

    return BUILTIN_KR_HOLIDAYS.filter(rule => {
      if (rule.type === 'fixed-solar') {
        return solar.month() + 1 === rule.month && solar.date() === rule.day
      }

      return params.lunarMonth === rule.month && params.lunarDay === rule.day
    }).map(rule => ({ name: rule.name, source: 'builtin' as const }))
  }
}
