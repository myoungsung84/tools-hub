import { LocateFixed, MapPin } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { IpLookupData } from '../../lib/ip-lookup.types'

type Props = {
  data: IpLookupData
  hasMapCoords: boolean
  mapUrl: string | null
}

export default function IpLookupMapCard({ data, hasMapCoords, mapUrl }: Props) {
  if (data.isPrivate) {
    return (
      <Alert className='lg:col-span-2'>
        <LocateFixed />
        <AlertTitle>사설 IP 주소</AlertTitle>
        <AlertDescription>
          입력하신 주소는 사설 네트워크 대역(Private)에 속합니다. 인터넷상의 위치 정보가 없어 지도를
          표시할 수 없습니다.
        </AlertDescription>
      </Alert>
    )
  }

  if (!hasMapCoords) {
    return null
  }

  return (
    <Card className='lg:col-span-2' data-testid='ip-lookup-map'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <MapPin className='size-4 text-muted-foreground' />
          <CardTitle>지도</CardTitle>
        </div>
        <CardDescription>
          위도 {data.geo?.lat} · 경도 {data.geo?.lon}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-xl border border-border/60 shadow-sm'>
          {mapUrl ? (
            <iframe
              title='ip-lookup-map'
              src={mapUrl}
              className='h-80 w-full'
              loading='lazy'
              referrerPolicy='no-referrer-when-downgrade'
            />
          ) : (
            <div className='flex h-72 items-center justify-center text-sm text-muted-foreground'>
              지도를 불러오는 중입니다...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
