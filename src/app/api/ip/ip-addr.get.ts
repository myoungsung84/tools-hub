import { handleApi, success } from '@/lib/server'
import { isPrivateIp, normalizeUserAgent, pickClientIp, readUserAgent } from '@/lib/server/ip-utils'

import { fetchIpGeo } from './ip-addr.source'

async function handler(req: Request) {
  const headers = req.headers

  const ip = pickClientIp(headers)
  const uaRaw = readUserAgent(headers)
  const ua = normalizeUserAgent(uaRaw)

  const isPrivate = ip === 'unknown' ? false : isPrivateIp(ip)
  const geo = isPrivate ? null : await fetchIpGeo({ ip }, req.signal)

  console.log('[api.ip.addr]', {
    ip,
    isPrivate,
    geo: geo
      ? { country: geo.country_name ?? null, city: geo.city ?? null, org: geo.org ?? null }
      : null,
    ua: { browser: ua.browser, os: ua.os, isMobile: ua.isMobile },
  })

  return success({
    ip,
    isPrivate,
    geo: {
      country_name: geo?.country_name ?? (isPrivate ? 'Local' : undefined),
      city: geo?.city ?? (isPrivate ? 'Local' : undefined),
      org: geo?.org ?? (isPrivate ? 'Local Network' : undefined),
    },
    ua,
  })
}

export const GET = handleApi(handler, {
  tag: '[api.ip.addr]',
  internalMessage: 'IP address fetch failed',
})
