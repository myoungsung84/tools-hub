import { z } from 'zod'

/* ------------------------------------------------------------------
 * String
 * ------------------------------------------------------------------ */

/** 문자열 (앞뒤 공백 제거) */
export const zString = z.string().trim()

/** 비어있지 않은 문자열 */
export const zNonEmptyString = zString.min(1)

/* ------------------------------------------------------------------
 * Number (raw)
 * ------------------------------------------------------------------ */

/** 숫자 */
export const zNumber = z.number()

/** 정수 */
export const zInt = zNumber.int()

/** 양의 정수 */
export const zPositiveInt = zInt.positive()

/* ------------------------------------------------------------------
 * Number from string (query / params 전용)
 * ------------------------------------------------------------------ */

/**
 * 문자열 → 숫자 변환
 * - NaN 방지
 */
export const zNumberFromString = z
  .string()
  .transform(Number)
  .refine(v => !Number.isNaN(v), {
    message: 'Invalid number',
  })

/**
 * 문자열 → 유한 숫자
 * - NaN
 * - Infinity / -Infinity 방지
 */
export const zFiniteNumberFromString = zNumberFromString.refine(v => Number.isFinite(v), {
  message: 'Invalid finite number',
})

/**
 * 문자열 → 정수
 */
export const zIntFromString = zNumberFromString.refine(v => Number.isInteger(v), {
  message: 'Expected integer',
})

/**
 * 문자열 → 양의 정수
 */
export const zPositiveIntFromString = zIntFromString.refine(v => v > 0, {
  message: 'Expected positive integer',
})

/* ------------------------------------------------------------------
 * Common objects
 * ------------------------------------------------------------------ */

/**
 * 페이지네이션
 * - page: 기본 1
 * - size: 기본 20
 */
export const zPagination = z.object({
  page: zPositiveIntFromString.default(1),
  size: zPositiveIntFromString.default(20),
})

/**
 * 위경도 (lat/lng)
 */
export const zCoords = z.object({
  lat: zFiniteNumberFromString,
  lng: zFiniteNumberFromString,
})

/**
 * 위경도 (lat/lon)
 * - 외부 API/query에서 lon 쓰는 경우용
 */
export const zLatLon = z.object({
  lat: zFiniteNumberFromString,
  lon: zFiniteNumberFromString,
})

/* ------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------ */

/**
 * optional string with default
 */
export const zStringWithDefault = (def: string) => zString.optional().default(def)
