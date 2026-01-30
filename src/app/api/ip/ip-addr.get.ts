import { fetchIpAddrGeo } from '@/app/api/ip/ip-addr.source'
import { handleApi, success } from '@/lib/server'
import { isPrivateIp, normalizeUserAgent, pickClientIp, readUserAgent } from '@/lib/server/ip-utils'

async function handler(req: Request) {
  const headers = req.headers

  const ip = pickClientIp(headers)
  const uaRaw = readUserAgent(headers)
  const ua = normalizeUserAgent(uaRaw)

  const isPrivate = ip === 'unknown' ? false : isPrivateIp(ip)
  const result = isPrivate ? null : await fetchIpAddrGeo(ip, req.signal)

  return success({
    ip,
    isPrivate,
    geo: result?.geo ?? null,
    asn: result?.asn ?? null,
    ua,
  })
}

export const GET = handleApi(handler, {
  tag: '[api.ip.addr]',
  internalMessage: 'IP address fetch failed',
})
