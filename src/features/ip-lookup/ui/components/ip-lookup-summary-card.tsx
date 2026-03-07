import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { UNKNOWN } from '../../lib/ip-lookup.constants'
import type { IpLookupData } from '../../lib/ip-lookup.types'

type Props = {
  data: IpLookupData
}

export default function IpLookupSummaryCard({ data }: Props) {
  return (
    <Card className='lg:col-span-2'>
      <CardHeader>
        <CardTitle>요약</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
        <div className='rounded-lg border border-border/50 bg-muted/20 px-4 py-3'>
          <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
            IP 주소
          </p>
          <p className='mt-1.5 break-all font-mono text-sm font-semibold'>{data.ip}</p>
        </div>

        <div className='rounded-lg border border-border/50 bg-muted/20 px-4 py-3'>
          <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
            유형
          </p>
          <p className='mt-1.5 break-all font-mono text-sm font-semibold'>
            {data.isPrivate ? '사설 (Private)' : '공인 (Public)'}
          </p>
        </div>

        <div className='rounded-lg border border-border/50 bg-muted/20 px-4 py-3'>
          <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
            국가
          </p>
          <p className='mt-1.5 text-sm font-medium'>
            {data.geo?.countryName
              ? `${data.geo.countryName}${data.geo.country ? ` (${data.geo.country})` : ''}`
              : UNKNOWN}
          </p>
        </div>

        <div className='rounded-lg border border-border/50 bg-muted/20 px-4 py-3'>
          <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
            ASN
          </p>
          <p className='mt-1.5 text-sm font-medium'>
            {data.asn?.asn != null ? `AS${data.asn.asn}` : UNKNOWN}
          </p>
        </div>

        <div className='rounded-lg border border-border/50 bg-muted/20 px-4 py-3'>
          <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
            네트워크 사업자 (ISP)
          </p>
          <p className='mt-1.5 text-sm font-medium'>{data.asn?.org ?? UNKNOWN}</p>
        </div>
      </CardContent>
    </Card>
  )
}
