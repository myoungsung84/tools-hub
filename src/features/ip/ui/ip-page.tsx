'use client'

import { isNil } from 'lodash-es'
import { Cpu, Globe, Info, MapPin, Monitor, Shield } from 'lucide-react'
import useSWR from 'swr'

import type { IpInfo } from '@/features/ip/types'
import { apiGet } from '@/lib/client/api-client'

import InfoCard from './components/info-card'
import IpPageSkeleton from './components/ip-page-skeleton'

export default function IpPage() {
  const { data, error, isLoading } = useSWR<IpInfo>(
    '/api/ip',
    (path: string) => apiGet<IpInfo>({ path }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  )

  const wrapClass = 'w-full flex flex-1 flex-col items-center justify-center'

  if (isLoading || error || isNil(data)) {
    return <IpPageSkeleton wrapClass={wrapClass} />
  }

  const geo = data.geo
  const asn = data.asn

  return (
    <div className={`${wrapClass} relative overflow-x-hidden`}>
      <div
        className='pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                 w-[320px] sm:w-[500px]
                 h-[320px] sm:h-[500px]
                 bg-blue-500/10 rounded-full
                 blur-[100px] sm:blur-[120px]
                 -z-10'
      />

      <div className='mx-auto flex w-full max-w-[800px] flex-col items-center gap-12'>
        <div className='flex flex-col items-center gap-4'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20'>
            <Shield className='w-3.5 h-3.5' />
            Your Public IP Address
          </div>

          <h1 className='font-black leading-none tracking-tight tabular-nums text-[clamp(40px,10vw,100px)] bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent break-all'>
            {data.ip}
          </h1>

          <p className='text-sm text-muted-foreground font-medium'>
            {geo ? (
              <span className='flex items-center gap-1.5 justify-center'>
                <Globe className='w-4 h-4' />
                접속 위치:{' '}
                <span className='text-foreground'>
                  {geo.countryName} ({geo.country})
                </span>
              </span>
            ) : (
              '로컬/사설 IP 환경에서 접속 중입니다.'
            )}
          </p>
        </div>

        <div className='grid w-full gap-4 sm:grid-cols-2'>
          <InfoCard
            icon={<MapPin className='w-4 h-4 text-rose-400' />}
            title='Location'
            main={`${geo?.region ?? '-'} · ${geo?.city ?? '-'}`}
            sub={`Coordinates: ${geo?.lat?.toFixed(4) ?? '-'}, ${geo?.lon?.toFixed(4) ?? '-'}`}
            badge={`TZ: ${geo?.timezone ?? '-'}`}
          />

          <InfoCard
            icon={<Globe className='w-4 h-4 text-emerald-400' />}
            title='Network & ASN'
            main={asn?.org ?? 'Unknown Provider'}
            sub={asn?.asn ? `AS${asn.asn}` : 'No ASN Info'}
            badge={data.isPrivate ? 'Private' : 'Public Network'}
          />

          <InfoCard
            icon={<Monitor className='w-4 h-4 text-blue-400' />}
            title='Device & OS'
            main={`${data.ua?.browser ?? 'Unknown'} on ${data.ua?.os ?? 'Unknown'}`}
            sub={data.ua?.isMobile ? 'Mobile Device' : 'Desktop / Laptop'}
          />

          <InfoCard
            icon={<Cpu className='w-4 h-4 text-purple-400' />}
            title='Connection Detail'
            main={`Accuracy: ${geo?.accuracyRadiusKm ?? '0'}km`}
            sub='Based on MaxMind / IP Data'
          />

          <div className='sm:col-span-2 group relative overflow-hidden rounded-2xl border bg-neutral-900/40 p-5 text-left transition-all sm:hover:bg-neutral-900/60'>
            <div className='flex items-center gap-2 mb-2'>
              <Info className='w-4 h-4 text-muted-foreground' />
              <span className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                Raw User Agent
              </span>
            </div>
            <p className='break-all text-xs leading-relaxed text-muted-foreground/80 font-mono'>
              {data.ua.raw ?? '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
