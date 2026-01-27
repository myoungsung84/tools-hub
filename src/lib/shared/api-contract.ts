/**
 * API 성공 응답 타입
 * @template T - 응답 데이터 타입
 * @property {true} success - 성공 여부
 * @property {T} data - 응답 데이터
 */
export type ApiSuccess<T> = { success: true; data: T }

/**
 * API 실패 응답 타입
 * @property {false} success - 성공 여부
 * @property {Object} error - 에러 정보
 * @property {string} error.code - 에러 코드
 * @property {string} error.message - 에러 메시지
 */
export type ApiFailure = {
  success: false
  error: { code: string; message: string }
}

/**
 * API 응답 타입 (성공 또는 실패)
 * @template T - 응답 데이터 타입
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure
