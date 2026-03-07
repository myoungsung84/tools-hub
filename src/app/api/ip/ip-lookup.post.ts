import { isNil } from 'lodash-es'
import { z } from 'zod'

import { fetchIpAddrGeo } from '@/app/api/ip/ip-addr.source'
import { handleApi, success } from '@/lib/server'
import { ApiErrors } from '@/lib/server/core/api-error'
import { isPrivateIp } from '@/lib/server/ip-utils'

const bodySchema = z.object({
  ip: z
    .string()
    .trim()
    .pipe(z.union([z.ipv4(), z.ipv6()])),
})

async function handler(req: Request) {
  const json = await req.json()
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    throw ApiErrors.badRequest('IP address is required')
  }

  const { ip } = parsed.data
  const isPrivate = isPrivateIp(ip)

  const result = isPrivate ? null : await fetchIpAddrGeo(ip, req.signal)

  const cityUpdatedText =
    result?.sources?.find(source => source.key === 'mmdb-city')?.updatedText ?? null
  const asnUpdatedText =
    result?.sources?.find(source => source.key === 'mmdb-asn')?.updatedText ?? null

  return success(
    {
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
