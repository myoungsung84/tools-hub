/**
 * API 에러 클래스
 * @class ApiError
 * @extends {Error}
 */
export class ApiError extends Error {
  /** HTTP 상태 코드 */
  readonly status: number
  /** 에러 코드 */
  readonly code: string

  /**
   * ApiError 생성자
   * @param {number} status - HTTP 상태 코드
   * @param {string} code - 에러 코드
   * @param {string} message - 에러 메시지
   */
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

/**
 * 일반적인 API 에러를 생성하는 유틸리티 객체
 */
export const ApiErrors = {
  badRequest(message = 'bad request') {
    return new ApiError(400, 'BAD_REQUEST', message)
  },
  unauthorized(message = 'unauthorized') {
    return new ApiError(401, 'UNAUTHORIZED', message)
  },
  forbidden(message = 'forbidden') {
    return new ApiError(403, 'FORBIDDEN', message)
  },
  notFound(message = 'not found') {
    return new ApiError(404, 'NOT_FOUND', message)
  },
  upstream(message = 'upstream error') {
    return new ApiError(502, 'UPSTREAM_ERROR', message)
  },
  internal(message = 'internal error') {
    return new ApiError(500, 'INTERNAL_ERROR', message)
  },
}
