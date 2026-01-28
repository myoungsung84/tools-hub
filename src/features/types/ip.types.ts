export type IpUserAgent = {
  raw: string
  browser: 'Chrome' | 'Edge' | 'Safari' | 'Unknown'
  os: 'Windows' | 'macOS' | 'Android' | 'iOS' | 'Unknown'
  isMobile: boolean
}

export type IpInfo = {
  ip: string
  isPrivate: boolean
  country: string
  ua: IpUserAgent
}

export type IpApiResponse = { success: true; data: IpInfo }
