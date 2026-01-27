import { isNil } from 'lodash-es'
import { z } from 'zod'

import { createTtlCache } from '@/lib/server/cache'

const ipApiSchema = z.object({
  country_name: z.string().optional(),
  city: z.string().optional(),
  org: z.string().optional(),
})

export type IpGeo = z.infer<typeof ipApiSchema>

// 1시간 TTL
const geoCache = createTtlCache<IpGeo | null>(60 * 60 * 1000)

export async function fetchIpGeo(
  params: { ip: string },
  signal?: AbortSignal
): Promise<IpGeo | null> {
  const ip = params.ip
  if (isNil(ip)) return null

  const cached = geoCache.get(ip)
  if (!isNil(cached)) {
    return cached
  }

  if (ip === '::1' || ip === '127.0.0.1') {
    const v = ipApiSchema.parse({
      country_name: 'Localhost',
      city: 'Localhost',
      org: 'Localhost',
    })
    geoCache.set(ip, v)
    return v
  }

  const url = `https://ipapi.co/${encodeURIComponent(ip)}/json/`
  const res = await fetch(url, { signal, next: { revalidate: 60 } })

  if (!res.ok) {
    geoCache.set(ip, null)
    return null
  }

  const json = (await res.json()) as unknown
  const parsed = ipApiSchema.safeParse(json)
  if (!parsed.success) {
    geoCache.set(ip, null)
    return null
  }

  geoCache.set(ip, parsed.data)
  return parsed.data
}
