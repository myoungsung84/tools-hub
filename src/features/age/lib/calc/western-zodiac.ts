/**
 * 서양 별자리(태양궁)를 월/일 기준으로 계산합니다.
 *
 * @param month 1~12
 * @param day 1~31
 * @returns 별자리 이름, 범위 밖이면 null
 */
export function calcWesternZodiac(month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null

  // 기본: 염소자리(12/22~1/19)
  let sign = '염소자리'

  // 해당 날짜부터 시작(경계일 포함)
  if (afterOrEqual(month, day, 1, 20)) sign = '물병자리'
  if (afterOrEqual(month, day, 2, 19)) sign = '물고기자리'
  if (afterOrEqual(month, day, 3, 21)) sign = '양자리'
  if (afterOrEqual(month, day, 4, 20)) sign = '황소자리'
  if (afterOrEqual(month, day, 5, 21)) sign = '쌍둥이자리'
  if (afterOrEqual(month, day, 6, 22)) sign = '게자리'
  if (afterOrEqual(month, day, 7, 23)) sign = '사자자리'
  if (afterOrEqual(month, day, 8, 23)) sign = '처녀자리'
  if (afterOrEqual(month, day, 9, 23)) sign = '천칭자리'
  if (afterOrEqual(month, day, 10, 23)) sign = '전갈자리'
  if (afterOrEqual(month, day, 11, 23)) sign = '사수자리'
  if (afterOrEqual(month, day, 12, 22)) sign = '염소자리'

  return sign
}

function afterOrEqual(m: number, d: number, m0: number, d0: number) {
  return m > m0 || (m === m0 && d >= d0)
}
