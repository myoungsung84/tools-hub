import {
  ceil as _ceil,
  clamp as _clamp,
  floor as _floor,
  isFinite,
  round as _round,
  toNumber,
} from 'lodash-es'

/**
 * 문자열을 숫자로 변환합니다.
 * @param {string | null} v - 변환할 문자열 값
 * @returns {number | null} 유효한 숫자이면 숫자를 반환하고, 그렇지 않으면 null을 반환합니다.
 */
export function toNum(v: string | null): number | null {
  if (v == null) return null
  const n = toNumber(v)
  return isFinite(n) ? n : null
}

/**
 * 문자열을 정수로 변환합니다.
 * @param {string | null} v - 변환할 문자열 값
 * @returns {number | null} 유효한 정수이면 정수를 반환하고, 그렇지 않으면 null을 반환합니다.
 */
export function toInt(v: string | null): number | null {
  if (v == null) return null
  const n = toNumber(v)
  return isFinite(n) ? _floor(n) : null
}

/**
 * 문자열을 실수로 변환합니다.
 * @param {string | null} v - 변환할 문자열 값
 * @returns {number | null} 유효한 실수이면 실수를 반환하고, 그렇지 않으면 null을 반환합니다.
 */
export function toFloat(v: string | null): number | null {
  if (v == null) return null
  const n = toNumber(v)
  return isFinite(n) ? n : null
}

/**
 * 문자열을 양수로 변환합니다.
 * @param {string | null} v - 변환할 문자열 값
 * @returns {number | null} 유효한 양수(0보다 큰 수)이면 숫자를 반환하고, 그렇지 않으면 null을 반환합니다.
 */
export function toPositiveNum(v: string | null): number | null {
  const n = toNum(v)
  return n != null && n > 0 ? n : null
}

/**
 * 문자열을 음이 아닌 수로 변환합니다.
 * @param {string | null} v - 변환할 문자열 값
 * @returns {number | null} 유효한 음이 아닌 수(0 이상)이면 숫자를 반환하고, 그렇지 않으면 null을 반환합니다.
 */
export function toNonNegativeNum(v: string | null): number | null {
  const n = toNum(v)
  return n != null && n >= 0 ? n : null
}

/**
 * 문자열을 지정된 범위 내의 숫자로 변환합니다.
 * @param {string | null} v - 변환할 문자열 값
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {number | null} 범위 내의 유효한 숫자이면 숫자를 반환하고, 그렇지 않으면 null을 반환합니다.
 */
export function toNumInRange(v: string | null, min: number, max: number): number | null {
  const n = toNum(v)
  if (n == null) return null
  return n >= min && n <= max ? n : null
}

/**
 * 문자열을 지정된 범위 내의 정수로 변환합니다.
 * @param {string | null} v - 변환할 문자열 값
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {number | null} 범위 내의 유효한 정수이면 정수를 반환하고, 그렇지 않으면 null을 반환합니다.
 */
export function toIntInRange(v: string | null, min: number, max: number): number | null {
  const n = toInt(v)
  if (n == null) return null
  return n >= min && n <= max ? n : null
}

/**
 * 숫자를 지정된 범위로 제한합니다.
 * @param {number} n - 제한할 숫자
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {number} min과 max 사이로 제한된 숫자를 반환합니다.
 */
export function clampNum(n: number, min: number, max: number): number {
  return _clamp(n, min, max)
}

/**
 * 숫자를 지정된 소수점 자리수로 반올림합니다.
 * @param {number} n - 반올림할 숫자
 * @param {number} [digits=0] - 소수점 자리수 (기본값: 0)
 * @returns {number} 반올림된 숫자를 반환합니다.
 */
export function roundNum(n: number, digits = 0): number {
  return _round(n, digits)
}

/**
 * 숫자를 지정된 소수점 자리수로 내림합니다.
 * @param {number} n - 내림할 숫자
 * @param {number} [digits=0] - 소수점 자리수 (기본값: 0)
 * @returns {number} 내림된 숫자를 반환합니다.
 */
export function floorNum(n: number, digits = 0): number {
  return _floor(n * 10 ** digits) / 10 ** digits
}

/**
 * 숫자를 지정된 소수점 자리수로 올림합니다.
 * @param {number} n - 올림할 숫자
 * @param {number} [digits=0] - 소수점 자리수 (기본값: 0)
 * @returns {number} 올림된 숫자를 반환합니다.
 */
export function ceilNum(n: number, digits = 0): number {
  return _ceil(n * 10 ** digits) / 10 ** digits
}

/**
 * 안전하게 나눗셈을 수행합니다.
 * @param {number} a - 피제수
 * @param {number} b - 제수
 * @param {number | null} [fallback=null] - 나눗셈이 불가능할 때 반환할 값 (기본값: null)
 * @returns {number | null} 나눗셈 결과를 반환하고, 불가능한 경우 fallback 값을 반환합니다.
 */
export function safeDivide(a: number, b: number, fallback: number | null = null): number | null {
  if (!isFinite(a) || !isFinite(b) || b === 0) return fallback
  return a / b
}

/**
 * 숫자 값을 로케일 기준으로 포맷팅합니다.
 * @param {number | string | null | undefined} value - 포맷팅할 값
 * @param {string} [locale='ko-KR'] - 로케일 (기본값: ko-KR)
 * @returns {string} 포맷팅된 문자열을 반환합니다.
 */
export function formatNumber(
  value: number | string | null | undefined,
  locale: string = 'ko-KR'
): string {
  if (value === null || value === undefined) return '0'

  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN

  if (!Number.isFinite(num)) return '0'

  return new Intl.NumberFormat(locale).format(num)
}
