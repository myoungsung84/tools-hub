import { z } from 'zod'

import { ApiErrors, handleApi, success } from '@/lib/server'
import { isPrivateIp } from '@/lib/server/ip-utils'

const bodySchema = z.object({
  ip: z
    .string()
    .trim()
    .pipe(z.union([z.ipv4(), z.ipv6()])),
})

async function handler(req: Request) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    throw ApiErrors.badRequest('유효한 JSON 요청이 아닙니다.')
  }
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    throw ApiErrors.badRequest('유효한 IP 주소를 입력해 주세요.')
  }

  const { ip } = parsed.data
  const isPrivate = isPrivateIp(ip)

  return success(
    {
      ip,
      isPrivate,
      geo: null,
      asn: null,
      lookupStatus: 'unavailable',
      message: isPrivate
        ? '사설 IP 주소는 인터넷상의 위치 정보를 조회할 수 없습니다.'
        : '현재 버전은 요청 헤더 기반 조회만 지원하므로 입력한 IP의 위치 정보는 제공하지 않습니다.',
    },
    {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  )
}

export const POST = handleApi(handler, {
  tag: '[api.ip.lookup]',
  internalMessage: 'IP lookup failed',
})
