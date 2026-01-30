export type IpInfo = {
  ip: string
  isPrivate: boolean
  geo: {
    country: string
    countryName: string
    region: string
    city: string
    lat: number
    lon: number
    timezone: string
    accuracyRadiusKm: number
  } | null
  asn: {
    asn: number
    org: string
  } | null
  ua: {
    raw: string
    browser: string
    os: string
    isMobile: boolean
  }
}
