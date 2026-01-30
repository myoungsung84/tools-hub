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
  meta?: {
    hasCityDb?: boolean
    hasAsnDb?: boolean
  } | null
}

const GEO_API_BASE = process.env.GEO_API_BASE ?? ''

export async function fetchIpAddrGeo(
  ip: string,
  signal?: AbortSignal
): Promise<IpAddrGeoResponse | null> {
  if (!ip || ip === 'unknown') return null

  const res = await fetch(`${GEO_API_BASE}/geo?ip=${encodeURIComponent(ip)}`, {
    signal,
    headers: { accept: 'application/json' },
  })

  if (!res.ok) throw new Error(`geo-api failed: ${res.status}`)

  const json = (await res.json()) as {
    ok: boolean
    data?: IpAddrGeoResponse
    meta?: { ts?: string }
    error?: { message?: string }
  }

  if (!json.ok) {
    throw new Error(json.error?.message ?? 'geo-api returned ok=false')
  }

  return json.data ?? null
}
