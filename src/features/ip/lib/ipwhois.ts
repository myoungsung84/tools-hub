import { z } from 'zod'

import type { IpGeo } from '@/features/ip/types'
import { ttlGet, ttlSet } from '@/lib/server/ttl-cache'

const TTL_MS = 24 * 60 * 60 * 1000 // 24시간
const CACHE_PREFIX = 'ipwhois:'

const ipWhoisSchema = z.object({
  ip: z.string(),
  success: z.boolean(),
  type: z.string().nullish(),
  continent: z.string().nullish(),
  continent_code: z.string().nullish(),
  country: z.string().nullish(),
  country_code: z.string().nullish(),
  region: z.string().nullish(),
  city: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  is_eu: z.boolean().nullish(),
  flag: z
    .object({
      emoji: z.string().nullish(),
    })
    .nullish(),
  connection: z
    .object({
      asn: z.number().nullish(),
      org: z.string().nullish(),
      isp: z.string().nullish(),
    })
    .nullish(),
  timezone: z
    .object({
      id: z.string().nullish(),
      abbr: z.string().nullish(),
      utc: z.string().nullish(),
    })
    .nullish(),
})

type IpWhoisRaw = z.infer<typeof ipWhoisSchema>

function normalize(raw: IpWhoisRaw): IpGeo {
  return {
    continent: raw.continent ?? null,
    continentCode: raw.continent_code ?? null,
    country: raw.country ?? null,
    countryCode: raw.country_code ?? null,
    region: raw.region ?? null,
    city: raw.city ?? null,
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    isEu: raw.is_eu ?? false,
    flagEmoji: raw.flag?.emoji ?? null,
    asn: raw.connection?.asn ?? null,
    org: raw.connection?.org ?? null,
    isp: raw.connection?.isp ?? null,
    timezone:
      raw.timezone?.id || raw.timezone?.abbr || raw.timezone?.utc
        ? {
            id: raw.timezone.id ?? null,
            abbr: raw.timezone.abbr ?? null,
            utc: raw.timezone.utc ?? null,
          }
        : null,
  }
}

export async function fetchIpGeo(ip: string): Promise<IpGeo | null> {
  const cacheKey = `${CACHE_PREFIX}${ip}`
  const cached = ttlGet<IpGeo | null>(cacheKey)
  if (cached !== undefined) return cached

  try {
    const res = await fetch(`https://ipwho.is/${ip}`, {
      next: { revalidate: 86400 },
    })

    if (!res.ok) {
      ttlSet(cacheKey, null, TTL_MS)
      return null
    }

    const json: unknown = await res.json()
    const parsed = ipWhoisSchema.safeParse(json)

    if (!parsed.success || !parsed.data.success) {
      ttlSet(cacheKey, null, TTL_MS)
      return null
    }

    const geo = normalize(parsed.data)
    ttlSet(cacheKey, geo, TTL_MS)
    return geo
  } catch {
    return null
  }
}

export type { IpWhoisRaw }
