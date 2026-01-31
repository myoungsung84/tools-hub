'use client'

import { isNil } from 'lodash-es'
import { Cpu, Globe, Info, MapPin, Monitor, Shield } from 'lucide-react'
import useSWR from 'swr'

import { Skeleton } from '@/components/ui/skeleton'
import type { IpInfo } from '@/features/ip/types'
import { apiGet } from '@/lib/client/api-client'

export default function IpPage() {
  const { data, error, isLoading } = useSWR<IpInfo>(
    '/api/ip',
    (path: string) => apiGet<IpInfo>({ path }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  )

  const wrapClass =
    'relative mx-auto flex w-full max-w-[1000px] flex-1 flex-col items-center justify-center px-6 py-12 text-center'

  if (isLoading || error || isNil(data)) {
    return (
      <div className={wrapClass}>
        <div className='w-full max-w-[640px] space-y-6'>
          <Skeleton className='mx-auto h-12 w-64 rounded-2xl' />
          <Skeleton className='mx-auto h-24 w-full rounded-3xl' />
          <div className='grid gap-4 sm:grid-cols-2 mt-8'>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className='h-32 w-full rounded-2xl' />
            ))}
          </div>
        </div>
      </div>
    )
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

/* Reusable Card Component */
function InfoCard({
  icon,
  title,
  main,
  sub,
  badge,
}: {
  icon: React.ReactNode
  title: string
  main: string
  sub: string
  badge?: string
}) {
  return (
    <div className='group relative overflow-hidden rounded-2xl border bg-neutral-900/40 p-5 text-left transition-all hover:border-white/20 hover:bg-neutral-900/60'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <div className='p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors'>
            {icon}
          </div>
          <span className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
            {title}
          </span>
        </div>
        {badge && (
          <span className='text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground'>
            {badge}
          </span>
        )}
      </div>
      <div>
        <div className='text-base font-semibold text-white/90 truncate'>{main}</div>
        <div className='text-xs text-muted-foreground mt-1'>{sub}</div>
      </div>
    </div>
  )
}
