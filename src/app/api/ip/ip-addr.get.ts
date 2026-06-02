import { z } from 'zod'

import { fetchIpGeo } from '@/features/ip/lib/ipwhois'
import { ApiErrors, handleApi, success } from '@/lib/server'
import { isPrivateIp, normalizeUserAgent, pickClientIp, readUserAgent } from '@/lib/server/ip-utils'

const ipSchema = z.union([z.ipv4(), z.ipv6()])

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

async function handler(req: Request) {
  const { searchParams } = new URL(req.url)
  const ipParam = searchParams.get('ip')?.trim() || undefined

  const headers = req.headers
  const uaRaw = readUserAgent(headers)
  const ua = normalizeUserAgent(uaRaw)

  let targetIp: string

  if (ipParam !== undefined) {
    const result = ipSchema.safeParse(ipParam)
    if (!result.success) {
      throw ApiErrors.badRequest('유효한 IP 주소를 입력해 주세요.')
    }
    targetIp = result.data
  } else {
    targetIp = pickClientIp(headers)
  }

  const isUnknown = targetIp === '' || targetIp === 'unknown'
  const isPrivate = isUnknown ? false : isPrivateIp(targetIp)
  const ipType: 'IPv4' | 'IPv6' | null = isUnknown
    ? null
    : targetIp.includes(':')
      ? 'IPv6'
      : 'IPv4'

  const geo = isPrivate || isUnknown ? null : await fetchIpGeo(targetIp)

  return success(
    {
      ip: targetIp,
      isPrivate,
      ipType,
      geo,
      ua: {
        raw: uaRaw,
        browser: ua.browser,
        os: ua.os,
        isMobile: ua.isMobile,
      },
    },
    { headers: NO_CACHE_HEADERS }
  )
}

export const GET = handleApi(handler, {
  tag: '[api.ip.addr]',
  internalMessage: 'IP address fetch failed',
})
