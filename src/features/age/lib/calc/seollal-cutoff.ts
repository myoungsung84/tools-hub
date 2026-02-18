import { lunarToSolar } from '@fullstackfamily/manseryeok'
import dayjs from 'dayjs'

/**
 * 설날(음력 1/1) 기준으로 “띠 적용 연도”를 결정합니다.
 *
 * 규칙:
 * - 해당 출생 연도의 음력 1/1(설날)을 양력으로 구한다
 * - 출생일이 설날 “이전”이면 (연도 - 1) 적용
 *
 * 주의:
 * - @fullstackfamily/manseryeok 지원 범위(1900~2050) 밖이면 fallback 필요
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

  if (y < 1900 || y > 2050) {
    return {
      appliedYear: y,
      cutoffDate: null,
      note: '설 기준은 1900~2050년만 지원(범위 밖: 출생연도 기준 적용)',
    }
  }

  try {
    const r = lunarToSolar(y, 1, 1, false) as {
      solar?: { year?: number; month?: number; day?: number }
      lunar?: { year?: number; month?: number; day?: number; isLeapMonth?: boolean }
    }

    const solar = r?.solar
    if (!solar?.year || !solar?.month || !solar?.day) {
      return { appliedYear: y, cutoffDate: null, note: '설 결과 파싱 실패(출생연도 기준 적용)' }
    }

    const seollal = dayjs(`${solar.year}-${pad2(solar.month)}-${pad2(solar.day)}`)
    const cutoffDate = seollal.isValid() ? seollal.format('YYYY-MM-DD') : null

    const appliedYear = seollal.isValid() && b.isBefore(seollal, 'day') ? y - 1 : y

    return { appliedYear, cutoffDate, note: null }
  } catch {
    return { appliedYear: y, cutoffDate: null, note: '설 날짜 계산 실패(출생연도 기준 적용)' }
  }
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}
