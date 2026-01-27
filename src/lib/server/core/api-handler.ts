import { ApiError, ApiErrors } from './api-error'
import { failure } from './api-response'

/**
 * API 핸들러 옵션
 * @property {string} [tag] - 로그 태그
 * @property {string} [internalMessage] - 내부 에러 메시지
 * @property {(err: unknown, req: Request) => ApiError} [mapUnknown] - 알 수 없는 에러를 ApiError로 매핑하는 함수
 */
type ApiHandlerOptions = {
  tag?: string
  internalMessage?: string
  mapUnknown?: (err: unknown, req: Request) => ApiError
}

/**
 * API 핸들러를 래핑하여 에러를 처리합니다.
 * @param {(req: Request) => Response | Promise<Response>} handler - 요청을 처리하는 핸들러 함수
 * @param {ApiHandlerOptions} [opts] - 옵션 설정
 * @returns {(req: Request) => Response | Promise<Response>} 에러 처리가 적용된 핸들러 함수
 */
export function handleApi(
  handler: (req: Request) => Response | Promise<Response>,
  opts?: ApiHandlerOptions
) {
  return (req: Request) => {
    try {
      const out = handler(req)

      return Promise.resolve(out).catch(err => {
        if (err instanceof ApiError) return failure(err)

        if (opts?.tag) console.error(opts.tag, err)
        else console.error(err)

        const apiErr =
          opts?.mapUnknown?.(err, req) ??
          ApiErrors.internal(opts?.internalMessage ?? 'request failed')

        return failure(apiErr)
      })
    } catch (err) {
      if (err instanceof ApiError) return failure(err)

      if (opts?.tag) console.error(opts.tag, err)
      else console.error(err)

      const apiErr =
        opts?.mapUnknown?.(err, req) ??
        ApiErrors.internal(opts?.internalMessage ?? 'request failed')

      return failure(apiErr)
    }
  }
}
