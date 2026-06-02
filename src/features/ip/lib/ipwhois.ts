import { z } from 'zod'

import type { IpGeo } from '@/features/ip/types'
import { ttlGet, ttlSet } from '@/lib/server/ttl-cache'

const TTL_MS = 24 * 60 * 60 * 1000 // 24시간
const TTL_ERROR_MS = 5 * 60 * 1000 // 실패 캐시는 5분
const CACHE_PREFIX = 'ipwhois:'

const nullableNumber = z.preprocess(
  value => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value),
  z.number().nullish()
)

const nullableAsn = z.union([z.number(), z.string()]).nullish()

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
  latitude: nullableNumber,
  longitude: nullableNumber,
  is_eu: z.boolean().nullish(),
  asn: nullableAsn,
  org: z.string().nullish(),
  isp: z.string().nullish(),
  timezone: z
    .union([
      z.string(),
      z.object({
        id: z.string().nullish(),
        abbr: z.string().nullish(),
        utc: z.string().nullish(),
      }),
    ])
    .nullish(),
  flag: z
    .object({
      emoji: z.string().nullish(),
    })
    .nullish(),
  connection: z
    .object({
      asn: nullableAsn,
      org: z.string().nullish(),
      isp: z.string().nullish(),
    })
    .nullish(),
})

type IpWhoisRaw = z.infer<typeof ipWhoisSchema>

function normalizeAsn(asn: IpWhoisRaw['asn']): number | null {
  if (typeof asn === 'number') return asn
  if (typeof asn !== 'string') return null

  const numeric = Number(asn.replace(/^AS/i, '').trim())
  return Number.isFinite(numeric) ? numeric : null
}

function normalizeTimezone(raw: IpWhoisRaw['timezone']): IpGeo['timezone'] {
  if (!raw) return null
  if (typeof raw === 'string') {
    return raw ? { id: raw, abbr: null, utc: null } : null
  }

  return raw.id || raw.abbr || raw.utc
    ? {
        id: raw.id ?? null,
        abbr: raw.abbr ?? null,
        utc: raw.utc ?? null,
      }
    : null
}

function normalize(raw: IpWhoisRaw): IpGeo {
  const connectionAsn = raw.connection?.asn ?? raw.asn
  const org = raw.connection?.org ?? raw.org
  const isp = raw.connection?.isp ?? raw.isp

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
    asn: normalizeAsn(connectionAsn),
    org: org ?? null,
    isp: isp ?? null,
    timezone: normalizeTimezone(raw.timezone),
  }
}

export async function fetchIpGeo(ip: string): Promise<IpGeo | null> {
  const cacheKey = `${CACHE_PREFIX}${ip}`
  const cached = ttlGet<IpGeo | null>(cacheKey)
  if (cached !== undefined && (cached !== null || process.env.NODE_ENV === 'production')) {
    return cached
  }

  try {
    const res = await fetch(`https://ipwho.is/${ip}`, { cache: 'no-store' })

    if (!res.ok) {
      // 4xx (잘못된 IP 등)는 캐시하지 않음 — 재시도 여지를 남김
      console.error('[ipwhois] upstream http error', { ip, status: res.status })
      if (res.status < 500) return null
      ttlSet(cacheKey, null, TTL_ERROR_MS)
      return null
    }

    let json: unknown
    try {
      json = await res.json()
    } catch (error) {
      console.error('[ipwhois] invalid json response', { ip, error })
      ttlSet(cacheKey, null, TTL_ERROR_MS)
      return null
    }

    const parsed = ipWhoisSchema.safeParse(json)

    if (!parsed.success) {
      console.error('[ipwhois] response parse failed', {
        ip,
        issues: parsed.error.issues,
        body: json,
      })
      return null
    }

    if (!parsed.data.success) {
      console.error('[ipwhois] lookup failed', { ip, body: parsed.data })
      ttlSet(cacheKey, null, TTL_ERROR_MS)
      return null
    }

    const geo = normalize(parsed.data)
    ttlSet(cacheKey, geo, TTL_MS)
    return geo
  } catch (error) {
    console.error('[ipwhois] fetch failed', { ip, error })
    return null
  }
}

export type { IpWhoisRaw }
