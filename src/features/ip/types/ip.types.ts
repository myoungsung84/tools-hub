export type IpGeo = {
  continent: string | null
  continentCode: string | null
  country: string | null
  countryCode: string | null
  region: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  isEu: boolean
  flagEmoji: string | null
  asn: number | null
  org: string | null
  isp: string | null
  timezone: {
    id: string | null
    abbr: string | null
    utc: string | null
  } | null
}

export type IpInfo = {
  ip: string
  isPrivate: boolean
  ipType: 'IPv4' | 'IPv6' | null
  geo: IpGeo | null
  ua: {
    browser: string
    os: string
    isMobile: boolean
  }
}
