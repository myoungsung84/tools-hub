export type IpGeoInfo = {
  country: string | null
  countryName: string | null
  region: string | null
  city: string | null
  lat: number | null
  lon: number | null
  timezone: string | null
}

function readHeader(headers: Headers, key: string) {
  const value = headers.get(key)?.trim()
  if (!value) return null
  return value
}

function decodeHeaderValue(value: string | null) {
  if (!value) return null

  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    return value
  }
}

function readNumberHeader(headers: Headers, key: string) {
  const value = readHeader(headers, key)
  if (!value) return null

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

export function readRequestHeaderGeo(headers: Headers): IpGeoInfo | null {
  const country = readHeader(headers, 'x-vercel-ip-country')
  const region = decodeHeaderValue(readHeader(headers, 'x-vercel-ip-country-region'))
  const city = decodeHeaderValue(readHeader(headers, 'x-vercel-ip-city'))
  const lat = readNumberHeader(headers, 'x-vercel-ip-latitude')
  const lon = readNumberHeader(headers, 'x-vercel-ip-longitude')
  const timezone = decodeHeaderValue(readHeader(headers, 'x-vercel-ip-timezone'))

  if (!country && !region && !city && lat == null && lon == null && !timezone) {
    return null
  }

  return {
    country,
    countryName: country,
    region,
    city,
    lat,
    lon,
    timezone,
  }
}
