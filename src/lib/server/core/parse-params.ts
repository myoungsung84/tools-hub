import { z } from 'zod'

import { ApiErrors } from './api-error'

/**
 * 파라미터 파싱 옵션
 * @property {string} [message] - 에러 메시지
 * @property {Record<string, unknown>} [details] - 추가 세부 정보
 */
type ParseParamsOptions = {
  message?: string
  details?: Record<string, unknown>
}

/**
 * query/searchParams/route params 같이 "unknown input"을 zod로 검증 + 변환해서 반환
 * - 실패 시 ApiErrors.badRequest로 통일
 * - issues를 details로 넣어 디버깅/프론트 에러처리 가능하게 함
 * @template T - Zod 스키마 타입
 * @param {T} schema - 검증에 사용할 Zod 스키마
 * @param {unknown} input - 검증할 입력 데이터
 * @param {ParseParamsOptions} [opts] - 옵션 설정
 * @returns {z.infer<T>} 검증되고 변환된 데이터
 * @throws {ApiError} 검증 실패 시 BadRequest 에러를 던집니다.
 */
export function parseParams<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
  opts?: ParseParamsOptions
): z.infer<T> {
  const result = schema.safeParse(input)

  if (!result.success) {
    throw ApiErrors.badRequest(opts?.message ?? 'Invalid parameters')
  }

  return result.data
}
