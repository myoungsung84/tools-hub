import { apiPost } from '@/lib/client/api-client'

import type { IpLookupData } from './ip-lookup.types'

export function lookupIp(ip: string): Promise<IpLookupData> {
  return apiPost<IpLookupData>({
    path: '/api/ip',
    body: { ip },
  })
}
