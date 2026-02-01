import dayjs from 'dayjs'
import KoreanLunarCalendar from 'korean-lunar-calendar'
import { isNil } from 'lodash-es'

/**
 * 네이버식(설날 기준)으로 “띠 적용 연도”를 결정합니다.
 *
 * 규칙:
 * - 해당 출생 연도의 음력 1/1(설날)을 양력으로 구한다
 * - 출생일이 설날 “이전”이면 (연도 - 1) 적용
 *
 * 주의:
 * - 변환 라이브러리 범위(대략 1000~2050) 밖이면 fallback 필요
 *
 * @param birth YYYY-MM-DD
 */
export function resolveSeollalAppliedYear(birth: string): {
  appliedYear: number
  cutoffDate: string | null
  note: string | null
} {
  const b = dayjs(birth)
  if (!b.isValid()) {
    return { appliedYear: NaN, cutoffDate: null, note: 'invalid birth date' }
  }

  const y = b.year()

  // 라이브러리 범위 밖: year 기준 fallback
  if (y < 1000 || y > 2050) {
    return {
      appliedYear: y,
      cutoffDate: null,
      note: '설 기준은 1000~2050년만 지원(범위 밖: 출생연도 기준 적용)',
    }
  }

  const cal = new KoreanLunarCalendar()
  const ok = cal.setLunarDate(y, 1, 1, false)
  if (!ok) {
    return { appliedYear: y, cutoffDate: null, note: '설 날짜 계산 실패(출생연도 기준 적용)' }
  }

  const solar = cal.getSolarCalendar() as { year?: number; month?: number; day?: number }
  if (isNil(solar?.year) || isNil(solar?.month) || isNil(solar?.day)) {
    return { appliedYear: y, cutoffDate: null, note: '설 결과 파싱 실패(출생연도 기준 적용)' }
  }

  const seollal = dayjs(`${solar.year}-${pad2(solar.month)}-${pad2(solar.day)}`)
  const cutoffDate = seollal.isValid() ? seollal.format('YYYY-MM-DD') : null

  const appliedYear = seollal.isValid() && b.isBefore(seollal, 'day') ? y - 1 : y
  return { appliedYear, cutoffDate, note: null }
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}
