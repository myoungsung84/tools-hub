export type IpGeo = {
  country_name?: string
  city?: string
  org?: string
}

export type IpUserAgent = {
  raw: string
  browser: 'Chrome' | 'Edge' | 'Safari' | 'Unknown'
  os: 'Windows' | 'macOS' | 'Android' | 'iOS' | 'Unknown'
  isMobile: boolean
}

export type IpInfo = {
  ip: string
  isPrivate: boolean
  geo: IpGeo
  ua: IpUserAgent
}

export type IpApiResponse = { success: true; data: IpInfo }
