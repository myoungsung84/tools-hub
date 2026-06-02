import { z } from 'zod'

import type { IpGeo } from '@/features/ip/types'
import { ttlGet, ttlSet } from '@/lib/server/ttl-cache'

const TTL_MS = 24 * 60 * 60 * 1000 // 24시간
const CACHE_PREFIX = 'ipwhois:'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tools-hub.vercel.app'
const PROVIDER_HEADERS = {
  Accept: 'application/json',
  'User-Agent': `tools-hub/1.0 (+${SITE_URL})`,
}

const isDev = process.env.NODE_ENV === 'development'

const nullableNumber = z.any().transform(value => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null

  const numeric = Number(value.trim())
  return Number.isFinite(numeric) ? numeric : null
})

const nullableAsn = z.any().transform(value => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null

  const match = value.match(/\d+/)
  if (!match) return null

  const numeric = Number(match[0])
  return Number.isFinite(numeric) ? numeric : null
})

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
      }).passthrough(),
    ])
    .nullish(),
  flag: z
    .object({
      emoji: z.string().nullish(),
    })
    .passthrough()
    .nullish(),
  connection: z
    .object({
      asn: nullableAsn,
      org: z.string().nullish(),
      isp: z.string().nullish(),
    })
    .passthrough()
    .nullish(),
}).passthrough()

type IpWhoisRaw = z.infer<typeof ipWhoisSchema>

const ipApiCoSchema = z.object({
  ip: z.string().nullish(),
  error: z.boolean().nullish(),
  reason: z.string().nullish(),
  continent_code: z.string().nullish(),
  country_name: z.string().nullish(),
  country: z.string().nullish(),
  region: z.string().nullish(),
  city: z.string().nullish(),
  latitude: nullableNumber,
  longitude: nullableNumber,
  asn: nullableAsn,
  org: z.string().nullish(),
  timezone: z.string().nullish(),
  utc_offset: z.string().nullish(),
}).passthrough()

type IpApiCoRaw = z.infer<typeof ipApiCoSchema>

const CONTINENT_BY_CODE: Record<string, string> = {
  AF: 'Africa',
  AN: 'Antarctica',
  AS: 'Asia',
  EU: 'Europe',
  NA: 'North America',
  OC: 'Oceania',
  SA: 'South America',
}

function continentNameFromCode(code: string | null | undefined) {
  if (!code) return null
  return CONTINENT_BY_CODE[code.toUpperCase()] ?? null
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

function normalizeIpWhois(raw: IpWhoisRaw): IpGeo {
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
    asn: connectionAsn ?? null,
    org: org ?? null,
    isp: isp ?? null,
    timezone: normalizeTimezone(raw.timezone),
  }
}

function normalizeIpApiCo(raw: IpApiCoRaw): IpGeo {
  const continentCode = raw.continent_code ?? null

  return {
    continent: continentNameFromCode(continentCode),
    continentCode,
    country: raw.country_name ?? null,
    countryCode: raw.country ?? null,
    region: raw.region ?? null,
    city: raw.city ?? null,
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    isEu: false,
    flagEmoji: null,
    asn: raw.asn ?? null,
    org: raw.org ?? null,
    isp: raw.org ?? null,
    timezone: raw.timezone
      ? {
          id: raw.timezone,
          abbr: null,
          utc: raw.utc_offset ?? null,
        }
      : null,
  }
}

function hasGeoValue(geo: IpGeo) {
  return Boolean(
    geo.continent ||
      geo.continentCode ||
      geo.country ||
      geo.countryCode ||
      geo.region ||
      geo.city ||
      geo.latitude !== null ||
      geo.longitude !== null ||
      geo.flagEmoji ||
      geo.asn !== null ||
      geo.org ||
      geo.isp ||
      geo.timezone
  )
}

function logIpWhois(message: string, details?: Record<string, unknown>, devOnly = false) {
  if (devOnly && !isDev) return
  console.error(`[ipwhois] ${message}`, details)
}

async function readJsonBody(
  provider: string,
  ip: string,
  res: Response
): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    return { ok: true, body: await res.json() }
  } catch (error) {
    logIpWhois('invalid json', {
      provider,
      ip,
      status: res.status,
      contentType: res.headers.get('content-type'),
      error,
    })
    return { ok: false }
  }
}

async function fetchIpWhoisGeo(ip: string): Promise<IpGeo | null> {
  const provider = 'ipwho.is'
  const url = `https://ipwho.is/${ip}`
  logIpWhois('request', { provider, ip, url }, true)

  const res = await fetch(url, { cache: 'no-store', headers: PROVIDER_HEADERS })
  const contentType = res.headers.get('content-type')
  logIpWhois('response', { provider, ip, status: res.status, contentType }, true)

  const json = await readJsonBody(provider, ip, res)
  if (!json.ok) return null

  logIpWhois('body', { provider, ip, body: json.body }, true)

  if (!res.ok) {
    logIpWhois('http failed', {
      provider,
      ip,
      status: res.status,
      contentType,
      body: isDev ? json.body : undefined,
    })
    return null
  }

  const parsed = ipWhoisSchema.safeParse(json.body)

  if (!parsed.success) {
    logIpWhois('zod parse failed', {
      provider,
      ip,
      issues: parsed.error.issues,
      flattened: parsed.error.flatten(),
      body: json.body,
    }, true)
    return null
  }

  if (!parsed.data.success) {
    logIpWhois('lookup failed', { provider, ip, body: parsed.data }, true)
    return null
  }

  const geo = normalizeIpWhois(parsed.data)
  if (!hasGeoValue(geo)) {
    logIpWhois('normalized null', { provider, ip, geo }, true)
    return null
  }

  logIpWhois('normalized geo', { provider, ip, geo }, true)
  return geo
}

async function fetchIpApiCoGeo(ip: string): Promise<IpGeo | null> {
  const provider = 'ipapi.co'
  const url = `https://ipapi.co/${ip}/json/`
  logIpWhois('request', { provider, ip, url }, true)

  const res = await fetch(url, { cache: 'no-store', headers: PROVIDER_HEADERS })
  const contentType = res.headers.get('content-type')
  logIpWhois('response', { provider, ip, status: res.status, contentType }, true)

  const json = await readJsonBody(provider, ip, res)
  if (!json.ok) return null

  logIpWhois('body', { provider, ip, body: json.body }, true)

  if (!res.ok) {
    logIpWhois('http failed', {
      provider,
      ip,
      status: res.status,
      contentType,
      body: isDev ? json.body : undefined,
    })
    return null
  }

  const parsed = ipApiCoSchema.safeParse(json.body)
  if (!parsed.success) {
    logIpWhois('zod parse failed', {
      provider,
      ip,
      issues: parsed.error.issues,
      flattened: parsed.error.flatten(),
      body: json.body,
    }, true)
    return null
  }

  if (parsed.data.error) {
    logIpWhois('lookup failed', { provider, ip, body: parsed.data }, true)
    return null
  }

  const geo = normalizeIpApiCo(parsed.data)
  if (!hasGeoValue(geo)) {
    logIpWhois('normalized null', { provider, ip, geo }, true)
    return null
  }

  logIpWhois('normalized geo', { provider, ip, geo }, true)
  return geo
}

export async function fetchIpGeo(ip: string): Promise<IpGeo | null> {
  const cacheKey = `${CACHE_PREFIX}${ip}`
  const cached = ttlGet<IpGeo | null>(cacheKey)
  if (cached === null && isDev) {
    logIpWhois('cache hit null', { ip, ignored: true }, true)
  }
  if (cached !== undefined && (cached !== null || !isDev)) {
    if (cached === null) logIpWhois('cache hit null', { ip })
    return cached
  }

  try {
    const geo = (await fetchIpWhoisGeo(ip)) ?? (await fetchIpApiCoGeo(ip))
    if (!geo) return null

    ttlSet(cacheKey, geo, TTL_MS)
    return geo
  } catch (error) {
    logIpWhois('fetch failed', { ip, error })
    return null
  }
}
