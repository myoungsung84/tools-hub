import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { UNKNOWN } from '../../lib/ip-lookup.constants'
import type { IpLookupData } from '../../lib/ip-lookup.types'
import IpLookupEmptyState from './ip-lookup-empty-state'
import IpLookupResultRow from './ip-lookup-result-row'

type Props = {
  data: IpLookupData
}

export default function IpLookupLocationCard({ data }: Props) {
  return (
    <Card className='flex h-full flex-col lg:col-span-2' data-testid='ip-lookup-location'>
      <CardHeader>
        <CardTitle>위치 정보</CardTitle>
        <CardDescription>요청 헤더 또는 외부 조회에서 제공된 위치 정보</CardDescription>
      </CardHeader>
      <CardContent className='grid flex-1 auto-rows-fr gap-2.5 sm:grid-cols-2'>
        {data.geo ? (
          <>
            <IpLookupResultRow label='국가 코드' value={data.geo.country ?? UNKNOWN} />
            <IpLookupResultRow label='국가' value={data.geo.countryName ?? UNKNOWN} />
            <IpLookupResultRow label='지역 / 주' value={data.geo.region ?? UNKNOWN} />
            <IpLookupResultRow label='도시' value={data.geo.city ?? UNKNOWN} />
            <IpLookupResultRow label='위도 (Latitude)' value={data.geo.lat?.toString() ?? UNKNOWN} />
            <IpLookupResultRow label='경도 (Longitude)' value={data.geo.lon?.toString() ?? UNKNOWN} />
            <IpLookupResultRow label='시간대' value={data.geo.timezone ?? UNKNOWN} />
          </>
        ) : (
          <div className='sm:col-span-2'>
            <IpLookupEmptyState message='위치 정보를 가져올 수 없습니다.' />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
