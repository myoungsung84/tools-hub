export type IpLookupData = {
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
}

export type LookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: IpLookupData }
