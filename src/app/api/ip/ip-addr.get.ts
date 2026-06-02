import { readRequestHeaderGeo } from '@/app/api/ip/ip-addr.source'
import { handleApi, success } from '@/lib/server'
import { isPrivateIp, normalizeUserAgent, pickClientIp, readUserAgent } from '@/lib/server/ip-utils'

async function handler(req: Request) {
  const headers = req.headers

  const ip = pickClientIp(headers)
  const uaRaw = readUserAgent(headers)
  const ua = normalizeUserAgent(uaRaw)

  const isUnknownIp = ip === '' || ip === 'unknown'
  const isPrivate = isUnknownIp ? false : isPrivateIp(ip)
  const geo = isPrivate ? null : readRequestHeaderGeo(headers)

  return success(
    {
      ip,
      isPrivate,
      geo,
      asn: null,
      lookupStatus: geo ? 'available' : 'unavailable',
      message: geo
        ? null
        : '요청 헤더에서 제공된 위치 정보가 없어 IP 위치를 표시할 수 없습니다.',
      ua: {
        raw: uaRaw,
        browser: ua.browser,
        os: ua.os,
        isMobile: ua.isMobile,
      },
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

export const GET = handleApi(handler, {
  tag: '[api.ip.addr]',
  internalMessage: 'IP address fetch failed',
})
