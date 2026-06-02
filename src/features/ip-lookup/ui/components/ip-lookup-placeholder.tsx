import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { IDLE_SUMMARY_DESCRIPTION, IDLE_SUMMARY_TITLE } from '../../lib/ip-lookup.constants'
import IpLookupEmptyState from './ip-lookup-empty-state'

export default function IpLookupPlaceholder() {
  return (
    <>
      <Card className='lg:col-span-2 border-dashed border-border/60 bg-muted/10'>
        <CardHeader>
          <CardTitle>{IDLE_SUMMARY_TITLE}</CardTitle>
          <CardDescription>{IDLE_SUMMARY_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          <div className='rounded-lg border border-dashed border-border/60 bg-background/50 px-4 py-3'>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
              IP 주소
            </p>
            <p className='mt-1.5 text-sm text-muted-foreground/60'>예: 8.8.8.8</p>
          </div>
          <div className='rounded-lg border border-dashed border-border/60 bg-background/50 px-4 py-3'>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
              유형
            </p>
            <p className='mt-1.5 text-sm text-muted-foreground/60'>공인 / 사설 구분</p>
          </div>
          <div className='rounded-lg border border-dashed border-border/60 bg-background/50 px-4 py-3'>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
              국가 · 위치
            </p>
            <p className='mt-1.5 text-sm text-muted-foreground/60'>조회 전</p>
          </div>
          <div className='rounded-lg border border-dashed border-border/60 bg-background/50 px-4 py-3'>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
              ASN · ISP
            </p>
            <p className='mt-1.5 text-sm text-muted-foreground/60'>조회 전</p>
          </div>
        </CardContent>
      </Card>

      <Card className='lg:col-span-2 border-dashed border-border/60 bg-muted/10'>
        <CardHeader>
          <CardTitle>위치 정보 미리보기</CardTitle>
          <CardDescription>
            IP를 조회하면 국가, 지역, 시간대 정보가 여기에 표시됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-2.5 sm:grid-cols-2'>
          <IpLookupEmptyState message='조회 전에는 상태 안내가 여기에 표시됩니다.' />
          <IpLookupEmptyState message='좌표가 없으면 지도는 표시되지 않습니다.' />
        </CardContent>
      </Card>
    </>
  )
}
