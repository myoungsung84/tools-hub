import { NextResponse } from 'next/server'

import type { ApiFailure, ApiSuccess } from '@/lib/shared/api-contract'

import type { ApiError } from './api-error'

/**
 * 성공 응답을 반환합니다.
 * @template T - 응답 데이터 타입
 * @param {T} data - 응답 데이터
 * @param {ResponseInit} [init] - 응답 초기화 옵션
 * @returns {NextResponse<ApiSuccess<T>>} 성공 응답 객체
 */
export function success<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, init)
}

/**
 * 실패 응답을 반환합니다.
 * @param {ApiError} error - API 에러 객체
 * @returns {NextResponse<ApiFailure>} 실패 응답 객체
 */
export function failure(error: ApiError) {
  return NextResponse.json<ApiFailure>(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    },
    { status: error.status }
  )
}
