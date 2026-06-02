export type IpInfo = {
  ip: string
  isPrivate: boolean
  geo: {
    country: string | null
    countryName: string | null
    region: string | null
    city: string | null
    lat: number | null
    lon: number | null
    timezone: string | null
  } | null
  asn: {
    asn: number | null
    org: string | null
  } | null
  lookupStatus?: 'available' | 'unavailable'
  message?: string | null
  ua: {
    raw: string
    browser: string
    os: string
    isMobile: boolean
  }
}
