import 'dayjs/locale/ko'

import dayjs from 'dayjs'

dayjs.locale('ko')

/**
 * Date 또는 dayjs.Dayjs 인스턴스를 나타내는 타입
 */
type DateLike = Date | dayjs.Dayjs

/**
 * 12시간제 공통 계산 (내부 전용)
 *
 * @param t - dayjs 인스턴스
 * @returns 24시간제/12시간제 시간 및 오전/오후 정보
 * @internal
 */
function resolve12h(t: dayjs.Dayjs) {
  const h24 = t.hour()
  const h12 = h24 % 12 || 12

  return {
    h24,
    h12,
    meridiemKo: h24 < 12 ? '오전' : '오후',
    meridiemEn: h24 < 12 ? 'AM' : 'PM',
  }
}

/**
 * 현재 날짜를 한국어 형식으로 반환 (표시용)
 *
 * @param d - 날짜 객체 (기본값: 현재 날짜)
 * @returns 형식화된 날짜 문자열 (예: '2026년 1월 27일 화요일')
 * @example
 * ```ts
 * currentDate() // '2026년 1월 27일 월요일'
 * currentDate(new Date('2024-12-25')) // '2024년 12월 25일 수요일'
 * ```
 */
export function currentDate(d: DateLike = new Date()) {
  return dayjs(d).format('YYYY년 M월 D일 dddd')
}

/**
 * 현재 시각을 오전/오후와 함께 반환 (표시용)
 *
 * @param d - 날짜 객체 (기본값: 현재 날짜)
 * @returns 오전/오후 및 시간 정보를 포함한 객체
 * @example
 * ```ts
 * currentClock() // { meridiem: '오후', time: '03:12:08' }
 * currentClock(new Date('2024-12-25 09:30:00')) // { meridiem: '오전', time: '09:30:00' }
 * ```
 */
export function currentClock(d: DateLike = new Date()) {
  const t = dayjs(d)
  const { meridiemKo } = resolve12h(t)

  return {
    meridiem: meridiemKo,
    time: t.format('hh:mm:ss'),
  }
}

/**
 * 시계 숫자를 개별 파트로 분해 (UI 렌더링용)
 *
 * @param d - 날짜 객체 (기본값: 현재 날짜)
 * @returns AM/PM 및 시, 분, 초를 개별 문자열로 포함한 객체
 * @example
 * ```ts
 * clockParts() // { meridiem: 'PM', hh: '03', mm: '12', ss: '08' }
 * clockParts(new Date('2024-12-25 09:30:45')) // { meridiem: 'AM', hh: '09', mm: '30', ss: '45' }
 * ```
 */
export function clockParts(d: DateLike = new Date()) {
  const t = dayjs(d)
  const { h12, meridiemEn } = resolve12h(t)

  return {
    meridiem: meridiemEn,
    hh: String(h12).padStart(2, '0'),
    mm: t.format('mm'),
    ss: t.format('ss'),
  }
}
