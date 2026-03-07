import { z } from 'zod'

import { fetchIpAddrGeo } from '@/app/api/ip/ip-addr.source'
import { handleApi, success, ApiErrors } from '@/lib/server'
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

  const result = isPrivate ? null : await fetchIpAddrGeo(ip, req.signal)

  const cityUpdatedText =
    result?.sources?.find(source => source.key === 'mmdb-city')?.updatedText ?? null
  const asnUpdatedText =
    result?.sources?.find(source => source.key === 'mmdb-asn')?.updatedText ?? null

  const geo = result?.geo ?? null
  const asn = result?.asn ?? null

  return success(
    {
      ip,
      isPrivate,
      geo: geo === null ? null : { ...geo, updatedText: cityUpdatedText },
      asn: asn === null ? null : { ...asn, updatedText: asnUpdatedText },
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
