import dayjs from 'dayjs'

/**
 * 만 나이를 계산합니다.
 *
 * 규칙:
 * - (기준연도 - 출생연도)
 * - 기준일이 생일(월/일)을 지나지 않았다면 -1
 *
 * @param birth YYYY-MM-DD
 * @param asOf YYYY-MM-DD (기준일)
 * @returns 만 나이, 입력이 잘못되면 null
 */
export function calcManAge(birth: string, asOf: string): number | null {
  const b = dayjs(birth)
  const a = dayjs(asOf)
  if (!b.isValid() || !a.isValid()) return null
  if (a.isBefore(b, 'day')) return null

  let age = a.year() - b.year()

  const hadBirthday = a.month() > b.month() || (a.month() === b.month() && a.date() >= b.date())

  if (!hadBirthday) age -= 1
  return age
}

/**
 * 세는나이(전통식)를 계산합니다.
 *
 * 규칙:
 * - 태어난 해를 1살로
 * - 해가 바뀌면 +1
 *
 * @param birth YYYY-MM-DD
 * @param asOf YYYY-MM-DD
 * @returns 세는나이, 입력이 잘못되면 null
 */
export function calcKoreanAge(birth: string, asOf: string): number | null {
  const b = dayjs(birth)
  const a = dayjs(asOf)
  if (!b.isValid() || !a.isValid()) return null
  if (a.isBefore(b, 'day')) return null
  return a.year() - b.year() + 1
}

/**
 * 나이 관련 계산 결과를 묶어서 반환합니다.
 *
 * @param birth YYYY-MM-DD
 * @param asOf YYYY-MM-DD
 */
export function calcAgeSummary(birth: string, asOf: string) {
  return {
    manAge: calcManAge(birth, asOf),
    koreanAge: calcKoreanAge(birth, asOf),
  }
}
