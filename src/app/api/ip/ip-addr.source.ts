import { isNil } from 'lodash-es'

import { ApiErrors } from '@/lib/server'

type SourceInfo = {
  key: 'mmdb-city' | 'mmdb-asn'
  enabled: boolean
  updatedAt: string | null
  updatedText: string
  builtAt: string | null
  builtText: string
  dbType: string | null
}

type IpAddrGeoResponse = {
  ip: string
  geo: {
    country: string | null
    countryName: string | null
    region: string | null
    city: string | null
    lat: number | null
    lon: number | null
    timezone: string | null
    accuracyRadiusKm: number | null
  } | null
  asn: {
    asn: number | null
    org: string | null
  } | null
  sources: SourceInfo[]
}

type ApiEnvelope<T> = {
  ok: boolean
  data?: T
  meta?: {
    respondedAt?: string
    status?: number
  }
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

const GEO_API_BASE = process.env.GEO_API_BASE ?? ''

export async function fetchIpAddrGeo(
  ip: string,
  signal?: AbortSignal
): Promise<IpAddrGeoResponse | null> {
  if (isNil(ip) || ip === '' || ip === 'unknown') return null

  const res = await fetch(`${GEO_API_BASE}/geo?ip=${encodeURIComponent(ip)}`, {
    signal,
    headers: { accept: 'application/json' },
  })

  if (!res.ok) {
    throw ApiErrors.upstream(`geo-api bad response: ${res.status}`)
  }

  const json = (await res.json()) as ApiEnvelope<IpAddrGeoResponse>

  if (!json.ok) {
    throw ApiErrors.upstream(
      `geo-api error: ${json.error?.code ?? 'UNKNOWN'} - ${json.error?.message ?? ''}`
    )
  }

  if (isNil(json.data)) return null

  return json.data
}
