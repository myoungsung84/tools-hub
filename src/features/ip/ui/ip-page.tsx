'use client'

import { isNil } from 'lodash-es'
import { Clock, Globe, Info, MapPin, Monitor, Network, Shield } from 'lucide-react'
import useSWR from 'swr'

import type { IpInfo } from '@/features/ip/types'
import { apiGet } from '@/lib/client/api-client'

import InfoCard from './components/info-card'
import IpPageSkeleton from './components/ip-page-skeleton'
import IpMapCard from './ip-map-card'

function IpResult({ data }: { data: IpInfo }) {
  const geo = data.geo
  const locationParts = [geo?.city, geo?.region, geo?.country].filter(Boolean)
  const locationLabel = locationParts.join(', ')
  const continentLabel =
    geo?.continent && geo?.continentCode
      ? `${geo.continent} (${geo.continentCode})`
      : (geo?.continent ?? null)
  const ispLabel = [geo?.isp, geo?.org].filter(Boolean).join(' · ')
  const hasCoords =
    typeof geo?.latitude === 'number' && typeof geo?.longitude === 'number'

  return (
    <div className='mx-auto flex w-full max-w-[800px] flex-col items-center gap-8'>
      <div className='flex flex-col items-center gap-4'>
        <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20'>
          <Shield className='w-3.5 h-3.5' />
          Your Public IP Address
        </div>

        <h2 className='font-black leading-none tracking-tight tabular-nums text-[clamp(32px,8vw,80px)] bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent break-all text-center'>
          {geo?.flagEmoji && <span className='mr-3'>{geo.flagEmoji}</span>}
          {data.ip}
        </h2>

        {data.ipType && (
          <span className='text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground'>
            {data.ipType}
          </span>
        )}

        {geo ? (
          <p className='text-sm text-muted-foreground flex items-center gap-1.5'>
            <Globe className='w-4 h-4' />
            <span className='text-foreground'>{locationLabel || '-'}</span>
          </p>
        ) : (
          <p className='text-sm text-muted-foreground'>
            {data.isPrivate
              ? '사설 IP 주소는 위치 정보를 조회할 수 없습니다.'
              : '위치 정보를 조회할 수 없습니다.'}
          </p>
        )}
      </div>

      <div className='grid w-full gap-4 sm:grid-cols-2'>
        <InfoCard
          icon={<MapPin className='w-4 h-4 text-rose-400' />}
          title='Location'
          main={locationLabel || '-'}
          sub={continentLabel ?? '-'}
          badge={
            hasCoords
              ? `${geo!.latitude!.toFixed(4)}, ${geo!.longitude!.toFixed(4)}`
              : undefined
          }
        />

        <InfoCard
          icon={<Network className='w-4 h-4 text-emerald-400' />}
          title='Network'
          main={ispLabel || '-'}
          sub={geo?.asn ? `AS${geo.asn}` : '-'}
          badge={data.isPrivate ? 'Private' : 'Public'}
        />

        <InfoCard
          icon={<Clock className='w-4 h-4 text-amber-400' />}
          title='Timezone'
          main={geo?.timezone?.id ?? '-'}
          sub={
            geo?.timezone?.abbr && geo?.timezone?.utc
              ? `${geo.timezone.abbr} (UTC${geo.timezone.utc})`
              : (geo?.timezone?.abbr ?? geo?.timezone?.utc ?? '-')
          }
        />

        <InfoCard
          icon={<Monitor className='w-4 h-4 text-blue-400' />}
          title='Device & OS'
          main={`${data.ua?.browser ?? 'Unknown'} on ${data.ua?.os ?? 'Unknown'}`}
          sub={data.ua?.isMobile ? 'Mobile Device' : 'Desktop / Laptop'}
        />

        {hasCoords && (
          <IpMapCard latitude={geo!.latitude!} longitude={geo!.longitude!} />
        )}

        <div className='sm:col-span-2 group relative overflow-hidden rounded-2xl border bg-neutral-900/40 p-5 text-left transition-all hover:bg-neutral-900/60'>
          <div className='flex items-center gap-2 mb-2'>
            <Info className='w-4 h-4 text-muted-foreground' />
            <span className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
              Raw User Agent
            </span>
          </div>
          <p className='break-all text-xs leading-relaxed text-muted-foreground/80 font-mono'>
            {data.ua?.raw ?? '-'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function IpPage() {
  const myIpKey = '/api/ip'
  const { data: myData, isLoading: myLoading } = useSWR<IpInfo>(
    myIpKey,
    (path: string) => apiGet<IpInfo>({ path }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  )

  const wrapClass = 'w-full flex flex-col items-center'

  return (
    <div className={`${wrapClass} relative overflow-x-hidden pt-4 pb-10`} data-testid='ip-page'>
      <div
        className='pointer-events-none absolute top-36 left-1/2 -translate-x-1/2
                 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px]
                 bg-blue-500/10 rounded-full blur-[100px] sm:blur-[120px] -z-10'
      />

      {myLoading || isNil(myData) ? (
        <IpPageSkeleton wrapClass='w-full max-w-[800px] mx-auto' />
      ) : (
        <IpResult data={myData} />
      )}
    </div>
  )
}
