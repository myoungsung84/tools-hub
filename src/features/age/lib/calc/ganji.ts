const HEAVENLY = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const
const EARTHLY = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const

const HEAVENLY_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const EARTHLY_HANJA = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
] as const

/**
 * 출생년도(year) 기준으로 간지(60갑자)를 계산합니다.
 *
 * 기준:
 * - 1984년 = 갑자년(甲子)
 *
 * @param year 양력 연도
 * @returns { label: '갑자년', hanja: '甲子年' }
 */
export function calcGanjiYear(year: number): { label: string; hanja: string } {
  const baseYear = 1984
  const offset = year - baseYear

  const stemIdx = mod(offset, 10)
  const branchIdx = mod(offset, 12)

  const label = `${HEAVENLY[stemIdx]}${EARTHLY[branchIdx]}년`
  const hanja = `${HEAVENLY_HANJA[stemIdx]}${EARTHLY_HANJA[branchIdx]}年`

  return { label, hanja }
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}
