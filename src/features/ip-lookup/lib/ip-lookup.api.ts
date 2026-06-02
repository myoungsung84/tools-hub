import type { IpInfo } from '@/features/ip/types'
import { apiGet } from '@/lib/client/api-client'

import type { IpLookupData } from './ip-lookup.types'

export function lookupIp(ip: string): Promise<IpLookupData> {
  return apiGet<IpInfo, IpLookupData>({
    path: '/api/ip',
    query: { ip },
    map: (info): IpLookupData => ({
      ip: info.ip,
      isPrivate: info.isPrivate,
      geo: info.geo
        ? {
            country: info.geo.countryCode,
            countryName: info.geo.country,
            region: info.geo.region,
            city: info.geo.city,
            lat: info.geo.latitude,
            lon: info.geo.longitude,
            timezone: info.geo.timezone?.id ?? null,
          }
        : null,
      asn: info.geo
        ? {
            asn: info.geo.asn,
            org: info.geo.isp ?? info.geo.org,
          }
        : null,
    }),
  })
}
