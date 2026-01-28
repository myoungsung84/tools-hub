import { handleApi, success } from '@/lib/server'
import {
  isPrivateIp,
  normalizeUserAgent,
  pickClientIp,
  pickCountry,
  readUserAgent,
} from '@/lib/server/ip-utils'

async function handler(req: Request) {
  const headers = req.headers

  const ip = pickClientIp(headers)
  const uaRaw = readUserAgent(headers)
  const ua = normalizeUserAgent(uaRaw)
  const country = pickCountry(headers)

  const isPrivate = ip === 'unknown' ? false : isPrivateIp(ip)

  return success({
    ip,
    isPrivate,
    country: country,
    ua: ua,
  })
}

export const GET = handleApi(handler, {
  tag: '[api.ip.addr]',
  internalMessage: 'IP address fetch failed',
})
