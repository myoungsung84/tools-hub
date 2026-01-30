import { isNil } from 'lodash-es'

import { fetchIpAddrGeo } from '@/app/api/ip/ip-addr.source'
import { handleApi, success } from '@/lib/server'
import { isPrivateIp, normalizeUserAgent, pickClientIp, readUserAgent } from '@/lib/server/ip-utils'

async function handler(req: Request) {
  const headers = req.headers

  const ip = pickClientIp(headers)
  const uaRaw = readUserAgent(headers)
  const ua = normalizeUserAgent(uaRaw)

  const isUnknownIp = isNil(ip) || ip === '' || ip === 'unknown'
  const isPrivate = isUnknownIp ? false : isPrivateIp(ip)

  const result = isPrivate ? null : await fetchIpAddrGeo(ip, req.signal)

  const cityUpdatedText = result?.sources?.find(s => s.key === 'mmdb-city')?.updatedText ?? null

  const asnUpdatedText = result?.sources?.find(s => s.key === 'mmdb-asn')?.updatedText ?? null

  return success({
    ip,
    isPrivate,
    geo: isNil(result)
      ? null
      : {
          ...result.geo,
          updatedText: cityUpdatedText,
        },
    asn: isNil(result)
      ? null
      : {
          ...result.asn,
          updatedText: asnUpdatedText,
        },
    ua: {
      browser: ua.browser,
      os: ua.os,
      isMobile: ua.isMobile,
    },
  })
}

export const GET = handleApi(handler, {
  tag: '[api.ip.addr]',
  internalMessage: 'IP address fetch failed',
})
