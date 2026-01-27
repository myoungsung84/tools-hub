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

  const country = data?.geo?.country_name ?? '-'
  const city = data?.geo?.city ?? '-'
  const org = data?.geo?.org ?? '-'

  const browser = data?.ua?.browser ?? 'Unknown'
  const os = data?.ua?.os ?? 'Unknown'
  const isMobile = data?.ua?.isMobile ?? false
  const uaRaw = data?.ua?.raw ?? '-'

  const wrapClass =
    'mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[900px] flex-col items-center justify-center px-6 text-center'

  if (isLoading) {
    return (
      <div className={wrapClass}>
        <div className='w-full max-w-[640px] space-y-4'>
          <Skeleton className='mx-auto h-12 w-72 sm:h-14' />
          <Skeleton className='mx-auto h-4 w-[520px] max-w-full' />
          <Skeleton className='mx-auto h-4 w-[480px] max-w-full' />
          <Skeleton className='mx-auto h-28 w-full max-w-[640px]' />
        </div>
      </div>
    )
  }

  if (error || isNil(data)) {
    return (
      <div className={wrapClass}>
        <div className='w-full max-w-[640px] space-y-2'>
          <div className='text-sm font-medium'>IP 불러오기 실패</div>
          <div className='text-xs text-muted-foreground'>
            {String((error as Error)?.message ?? 'unknown error')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={wrapClass}>
      <div className='mx-auto flex w-full max-w-[640px] flex-col items-center gap-12'>
        <div className='flex w-full flex-col items-center gap-6 text-center'>
          <div className='text-sm text-muted-foreground'>Your IP Address</div>
          <div className='text-8xl font-bold tracking-tight leading-none tabular-nums'>
            {data.ip}
          </div>
          <div className='text-sm text-muted-foreground'>
            {data.isPrivate
              ? '로컬/사설 네트워크에서 접속 중입니다.'
              : `접속한 국가는 ${country} (${city}) 입니다.`}
          </div>
        </div>

        <div className='w-4/5 rounded-xl border bg-neutral-900/40 p-6 text-left'>
          <div className='flex flex-col gap-6'>
            {/* Network status */}
            <div className='flex items-center gap-2'>
              <div className='text-[12px] text-muted-foreground'>Network</div>

              {data.isPrivate ? (
                <span className='rounded-md border px-2 py-0.5 text-[12px] text-muted-foreground'>
                  Private
                </span>
              ) : (
                <span className='rounded-md border px-2 py-0.5 text-[12px] text-muted-foreground'>
                  Public
                </span>
              )}
            </div>

            <div className='grid gap-6 sm:grid-cols-2'>
              {/* Geo */}
              <div className='flex flex-col gap-0.5'>
                <div className='text-[12px] text-muted-foreground'>Geo</div>
                <div className='text-sm'>
                  {country} · {city}
                </div>
                <div className='text-xs text-muted-foreground'>{org}</div>
              </div>

              {/* UA summary */}
              <div className='flex flex-col gap-0.5'>
                <div className='text-[12px] text-muted-foreground'>User Agent</div>
                <div className='text-sm'>
                  {browser} · {os}
                  {isMobile ? ' · Mobile' : ''}
                </div>
              </div>

              {/* UA raw */}
              <div className='flex flex-col gap-0.5 sm:col-span-2'>
                <div className='text-[12px] text-muted-foreground'>UA Raw</div>
                <div className='break-words text-xs text-muted-foreground'>{uaRaw}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
