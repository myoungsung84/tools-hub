import { getGapja } from '@fullstackfamily/manseryeok'
import dayjs from 'dayjs'

type IpchunResolved = {
  appliedYear: number
  cutoffDate: string | null
  note: string | null
}

/**
 * 입춘 기준(사주식)으로 "띠 적용 연도"를 결정합니다.
 *
 * 구현 방식:
 * - @fullstackfamily/manseryeok 의 getGapja()는 입춘 경계에 따라 yearPillar가 바뀌도록 설계되어 있음
 * - 출생일의 yearPillar 와 (해당 연도) 12/31의 yearPillar를 비교해,
 *   같으면 appliedYear=y, 다르면 appliedYear=y-1 로 판정
 *
 * 장점:
 * - 입춘 날짜/시각을 직접 계산하거나 근사(2/4 고정)할 필요가 없음
 * - 절기 시각 API가 없어도 "입춘 기준 연도 판정"은 정확하게 가능
 *
 * @param birth YYYY-MM-DD
 */
export function resolveIpchunAppliedYear(birth: string): IpchunResolved {
  const b = dayjs(birth)
  if (!b.isValid()) {
    return { appliedYear: Number.NaN, cutoffDate: null, note: '생년월일 형식이 올바르지 않아요' }
  }

  const y = b.year()
  // manseryeok 지원 범위(문서상 1900~2050). 범위 밖이면 안전하게 근사/예외 처리.
  if (y < 1900 || y > 2050) {
    return {
      appliedYear: y,
      cutoffDate: null,
      note: '1900~2050년 사이만 정확한 입춘 계산이 가능해요 (출생년도로 대체)',
    }
  }

  try {
    const birthGapja = getGapja(y, b.month() + 1, b.date())
    const endOfYearGapja = getGapja(y, 12, 31)

    const samePillar = birthGapja.yearPillar === endOfYearGapja.yearPillar
    const appliedYear = samePillar ? y : y - 1

    return {
      appliedYear,
      cutoffDate: null,
      note: '입춘 경계를 고려하여 계산했어요',
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '알 수 없는 오류'
    return {
      appliedYear: y,
      cutoffDate: null,
      note: `입춘 계산 중 오류가 발생했어요: ${message}`,
    }
  }
}
