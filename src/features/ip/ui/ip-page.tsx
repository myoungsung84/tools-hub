'use client'

import { isNil } from 'lodash-es'
import useSWR from 'swr'

import { Skeleton } from '@/components/ui/skeleton'
import type { IpInfo } from '@/features/types'
import { apiGet } from '@/lib/client/api-client'

export default function IpPage() {
  const { data, error, isLoading } = useSWR<IpInfo>(
    '/api/ip',
    (path: string) => apiGet<IpInfo>({ path }),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  const country = data?.country ?? '-'
  const browser = data?.ua?.browser ?? 'Unknown'
  const os = data?.ua?.os ?? 'Unknown'
  const isMobile = data?.ua?.isMobile ?? false
  const uaRaw = data?.ua?.raw ?? '-'

  // ✅ 부모(main)의 남은 영역을 그대로 사용
  const wrapClass =
    'mx-auto flex w-full max-w-[900px] flex-1 flex-col items-center justify-center px-4 text-center sm:px-6'

  if (isLoading || error || isNil(data)) {
    return (
      <div className={wrapClass}>
        <div className='w-full max-w-[640px] space-y-4'>
          <Skeleton className='mx-auto h-10 w-48 sm:h-14 sm:w-72' />
          <Skeleton className='mx-auto h-4 w-full max-w-[520px]' />
          <Skeleton className='mx-auto h-4 w-full max-w-[480px]' />
          <Skeleton className='mx-auto h-28 w-full max-w-[640px]' />
        </div>
      </div>
    )
  }

  return (
    <div className={wrapClass}>
      <div className='mx-auto flex w-full max-w-[640px] flex-col items-center gap-10 sm:gap-12'>
        {/* IP */}
        <div className='flex w-full flex-col items-center gap-4 sm:gap-6'>
          <div className='text-xs text-muted-foreground sm:text-sm'>Your IP Address</div>

          <div className='font-bold leading-none tracking-tight tabular-nums text-[clamp(50px,11vw,120px)]'>
            {data.ip}
          </div>

          <div className='text-xs text-muted-foreground sm:text-sm'>
            {`접속한 국가는 ${country} 입니다.`}
          </div>
        </div>

        {/* Detail card */}
        <div className='w-full rounded-xl border bg-neutral-900/40 p-4 sm:p-6 text-left'>
          <div className='flex flex-col gap-6'>
            {/* Network */}
            <div className='flex items-center gap-2'>
              <div className='text-[11px] text-muted-foreground'>Network</div>
              <span className='text-[11px] text-muted-foreground'>
                {data.isPrivate ? 'Private' : 'Public'}
              </span>
            </div>

            <div className='grid gap-6 sm:grid-cols-2'>
              {/* UA summary */}
              <div className='flex flex-col gap-0.5'>
                <div className='text-[11px] text-muted-foreground'>User Agent</div>
                <div className='text-sm'>
                  {browser} · {os}
                  {isMobile ? ' · Mobile' : ''}
                </div>
              </div>

              {/* UA raw */}
              <div className='flex flex-col gap-0.5 sm:col-span-2'>
                <div className='text-[11px] text-muted-foreground'>UA Raw</div>
                <div className='break-words text-xs text-muted-foreground'>{uaRaw}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
