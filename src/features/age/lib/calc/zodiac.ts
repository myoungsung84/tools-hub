import { resolveIpchunAppliedYear } from './ipchun-cutoff'
import { resolveSeollalAppliedYear } from './seollal-cutoff'

export const ZODIAC12 = [
  '쥐',
  '소',
  '호랑이',
  '토끼',
  '용',
  '뱀',
  '말',
  '양',
  '원숭이',
  '닭',
  '개',
  '돼지',
] as const

export type ZodiacBasis = 'year' | 'seollal' | 'ipchun'

/**
 * 띠를 계산합니다.
 *
 * basis:
 * - year: 출생 “연도” 그대로 사용(일반적)
 * - seollal: 설날 이전 출생이면 전년도 적용(네이버식)
 * - ipchun: 입춘 이전 출생이면 전년도 적용(사주식 근사)
 *
 * 기준:
 * - 1984년 = 갑자년 = 쥐띠(자)로 두고 12년 주기로 순환
 *
 * @param birth YYYY-MM-DD
 * @param basis 'year' | 'seollal' | 'ipchun'
 */
export function calcZodiac(birth: string, basis: ZodiacBasis) {
  const y0 = Number(birth.slice(0, 4))

  const resolved =
    basis === 'seollal'
      ? resolveSeollalAppliedYear(birth)
      : basis === 'ipchun'
        ? resolveIpchunAppliedYear(birth)
        : { appliedYear: y0, cutoffDate: null, note: null }

  const y = resolved.appliedYear
  if (!Number.isFinite(y)) {
    return {
      label: '-',
      basis,
      appliedYear: y,
      cutoffDate: resolved.cutoffDate,
      note: resolved.note ?? 'invalid year',
    }
  }

  const baseYear = 1984
  const idx = mod(y - baseYear, 12)
  const animal = ZODIAC12[idx]

  return {
    label: `${animal}띠`,
    basis,
    appliedYear: y,
    cutoffDate: resolved.cutoffDate,
    note: resolved.note,
  }
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}
