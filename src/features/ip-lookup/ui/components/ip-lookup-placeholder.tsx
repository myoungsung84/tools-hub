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
            <p className='mt-1.5 text-sm text-muted-foreground/60'>국가, 도시, 시간대</p>
          </div>
          <div className='rounded-lg border border-dashed border-border/60 bg-background/50 px-4 py-3'>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
              ASN · ISP
            </p>
            <p className='mt-1.5 text-sm text-muted-foreground/60'>네트워크 사업자 정보</p>
          </div>
        </CardContent>
      </Card>

      <Card className='lg:col-span-2 border-dashed border-border/60 bg-muted/10'>
        <CardHeader>
          <CardTitle>위치 정보 미리보기</CardTitle>
          <CardDescription>
            조회 후에는 아래 영역에 국가, 지역, 도시, 좌표, 위치 정확도 반경 정보가 표시됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-2.5 sm:grid-cols-2'>
          <IpLookupEmptyState message='조회 전에는 위치 정보가 여기에 표시됩니다.' />
          <IpLookupEmptyState message='공인 IP라면 지도도 함께 표시됩니다.' />
        </CardContent>
      </Card>
    </>
  )
}
