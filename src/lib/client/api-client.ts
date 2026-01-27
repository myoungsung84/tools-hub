/**
 * API 에러 응답의 기본 형태
 */
type ApiErrorShape = { message: string }

/**
 * API 응답의 공통 타입
 *
 * @template T - 성공 시 반환되는 데이터 타입
 */
export type ApiResponse<T> = { success: true; data: T } | { success: false; error: ApiErrorShape }

/**
 * API 클라이언트에서 발생하는 에러
 *
 * @example
 * ```ts
 * throw new ApiClientError('요청 실패', { status: 404 })
 * ```
 */
export class ApiClientError extends Error {
  /** HTTP 상태 코드 */
  readonly status?: number
  /** 원본 에러 */
  readonly cause?: unknown

  /**
   * @param message - 에러 메시지
   * @param opts - 추가 옵션
   * @param opts.status - HTTP 상태 코드
   * @param opts.cause - 원본 에러
   */
  constructor(message: string, opts?: { status?: number; cause?: unknown }) {
    super(message)
    this.name = 'ApiClientError'
    this.status = opts?.status
    this.cause = opts?.cause
  }
}

/**
 * 쿼리 파라미터로 사용 가능한 값의 타입
 */
type QueryValue = string | number | boolean | null | undefined

/**
 * 쿼리 파라미터 객체 타입
 */
type Query = Record<string, QueryValue>

/**
 * 쿼리 객체를 URL 쿼리 문자열로 변환
 *
 * @param query - 쿼리 파라미터 객체
 * @returns URL 쿼리 문자열 (예: '?key=value&foo=bar') 또는 빈 문자열
 * @internal
 */
function toQuery(query?: Query) {
  if (!query) return ''
  const q = new URLSearchParams()

  for (const [k, v] of Object.entries(query)) {
    if (v == null) continue
    q.set(k, String(v))
  }

  const s = q.toString()
  return s ? `?${s}` : ''
}

/**
 * 응답의 Content-Type이 JSON인지 확인
 *
 * @param res - Fetch Response 객체
 * @returns JSON 응답 여부
 * @internal
 */
function isJsonResponse(res: Response) {
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json')
}

/**
 * 응답 본문을 ApiResponse 형태의 JSON으로 파싱
 *
 * @template TDto - DTO 타입
 * @param res - Fetch Response 객체
 * @returns 파싱된 API 응답
 * @throws {ApiClientError} JSON이 아니거나 파싱 실패 시
 * @internal
 */
async function readApiJson<TDto>(res: Response): Promise<ApiResponse<TDto>> {
  if (!isJsonResponse(res)) {
    throw new ApiClientError('Non-JSON response', { status: res.status })
  }

  try {
    return (await res.json()) as ApiResponse<TDto>
  } catch (e) {
    throw new ApiClientError('Invalid JSON response', { status: res.status, cause: e })
  }
}

/**
 * API 요청을 수행하는 범용 함수
 *
 * @template TDto - 서버에서 반환하는 DTO 타입
 * @template TDomain - 클라이언트에서 사용할 도메인 타입 (기본값: TDto)
 * @param args - 요청 설정
 * @param args.method - HTTP 메서드
 * @param args.path - API 경로
 * @param args.query - 쿼리 파라미터
 * @param args.body - 요청 본문
 * @param args.signal - AbortSignal (요청 취소용)
 * @param args.headers - 추가 헤더
 * @param args.map - DTO를 도메인 모델로 변환하는 매퍼 함수
 * @returns 도메인 모델 데이터
 * @throws {ApiClientError} 요청 실패 시
 * @example
 * ```ts
 * const user = await apiRequest({
 *   method: 'GET',
 *   path: '/api/user',
 *   query: { id: 123 },
 *   map: (dto) => ({ ...dto, fullName: `${dto.firstName} ${dto.lastName}` })
 * })
 * ```
 */
export async function apiRequest<TDto, TDomain = TDto>(args: {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  query?: Query
  body?: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
  map?: (dto: TDto) => TDomain
}): Promise<TDomain> {
  const { method, path, query, body, signal, headers, map } = args

  const res = await fetch(`${path}${toQuery(query)}`, {
    method,
    signal,
    headers: {
      ...(body != null ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  })

  const json = await readApiJson<TDto>(res)

  // HTTP status 우선
  if (!res.ok) {
    const msg = !json.success ? json.error.message : `HTTP ${res.status}`
    throw new ApiClientError(msg, { status: res.status })
  }

  // ApiResponse(success=false) 처리
  if (!json.success) {
    throw new ApiClientError(json.error.message, { status: res.status })
  }

  return map ? map(json.data) : (json.data as unknown as TDomain)
}

// ---- thin wrappers (편의용) ----

/**
 * GET 요청을 수행
 *
 * @template TDto - 서버에서 반환하는 DTO 타입
 * @template TDomain - 클라이언트에서 사용할 도메인 타입 (기본값: TDto)
 * @param args - 요청 설정
 * @param args.path - API 경로
 * @param args.query - 쿼리 파라미터
 * @param args.signal - AbortSignal (요청 취소용)
 * @param args.headers - 추가 헤더
 * @param args.map - DTO를 도메인 모델로 변환하는 매퍼 함수
 * @returns 도메인 모델 데이터
 * @throws {ApiClientError} 요청 실패 시
 * @example
 * ```ts
 * const data = await apiGet({ path: '/api/data', query: { id: '123' } })
 * ```
 */
export function apiGet<TDto, TDomain = TDto>(args: {
  path: string
  query?: Query
  signal?: AbortSignal
  headers?: Record<string, string>
  map?: (dto: TDto) => TDomain
}) {
  return apiRequest<TDto, TDomain>({
    method: 'GET',
    ...args,
  })
}

/**
 * POST 요청을 수행
 *
 * @template TDto - 서버에서 반환하는 DTO 타입
 * @template TDomain - 클라이언트에서 사용할 도메인 타입 (기본값: TDto)
 * @param args - 요청 설정
 * @param args.path - API 경로
 * @param args.query - 쿼리 파라미터
 * @param args.body - 요청 본문
 * @param args.signal - AbortSignal (요청 취소용)
 * @param args.headers - 추가 헤더
 * @param args.map - DTO를 도메인 모델로 변환하는 매퍼 함수
 * @returns 도메인 모델 데이터
 * @throws {ApiClientError} 요청 실패 시
 * @example
 * ```ts
 * const result = await apiPost({ path: '/api/create', body: { name: 'test' } })
 * ```
 */
export function apiPost<TDto, TDomain = TDto>(args: {
  path: string
  query?: Query
  body?: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
  map?: (dto: TDto) => TDomain
}) {
  return apiRequest<TDto, TDomain>({
    method: 'POST',
    ...args,
  })
}

/**
 * PATCH 요청을 수행
 *
 * @template TDto - 서버에서 반환하는 DTO 타입
 * @template TDomain - 클라이언트에서 사용할 도메인 타입 (기본값: TDto)
 * @param args - 요청 설정
 * @param args.path - API 경로
 * @param args.query - 쿼리 파라미터
 * @param args.body - 요청 본문 (일부 필드 업데이트)
 * @param args.signal - AbortSignal (요청 취소용)
 * @param args.headers - 추가 헤더
 * @param args.map - DTO를 도메인 모델로 변환하는 매퍼 함수
 * @returns 도메인 모델 데이터
 * @throws {ApiClientError} 요청 실패 시
 * @example
 * ```ts
 * const updated = await apiPatch({ path: '/api/user/123', body: { name: 'new name' } })
 * ```
 */
export function apiPatch<TDto, TDomain = TDto>(args: {
  path: string
  query?: Query
  body?: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
  map?: (dto: TDto) => TDomain
}) {
  return apiRequest<TDto, TDomain>({
    method: 'PATCH',
    ...args,
  })
}

/**
 * DELETE 요청을 수행
 *
 * @template TDto - 서버에서 반환하는 DTO 타입
 * @template TDomain - 클라이언트에서 사용할 도메인 타입 (기본값: TDto)
 * @param args - 요청 설정
 * @param args.path - API 경로
 * @param args.query - 쿼리 파라미터
 * @param args.body - 요청 본문 (선택적)
 * @param args.signal - AbortSignal (요청 취소용)
 * @param args.headers - 추가 헤더
 * @param args.map - DTO를 도메인 모델로 변환하는 매퍼 함수
 * @returns 도메인 모델 데이터
 * @throws {ApiClientError} 요청 실패 시
 * @example
 * ```ts
 * await apiDelete({ path: '/api/user/123' })
 * ```
 */
export function apiDelete<TDto, TDomain = TDto>(args: {
  path: string
  query?: Query
  body?: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
  map?: (dto: TDto) => TDomain
}) {
  return apiRequest<TDto, TDomain>({
    method: 'DELETE',
    ...args,
  })
}
