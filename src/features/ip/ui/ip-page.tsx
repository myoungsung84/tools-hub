'use client'

import { isNil } from 'lodash-es'
import {
  Clock,
  Cpu,
  Globe,
  Info,
  MapPin,
  Monitor,
  Network,
  Search,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import useSWR from 'swr'

import type { IpInfo } from '@/features/ip/types'
import { apiGet } from '@/lib/client/api-client'

import InfoCard from './components/info-card'
import IpPageSkeleton from './components/ip-page-skeleton'
import IpMapCard from './ip-map-card'

function buildApiPath(searchIp?: string) {
  if (!searchIp) return '/api/ip'
  return `/api/ip?ip=${encodeURIComponent(searchIp)}`
}

function IpResult({ data, isSearch }: { data: IpInfo; isSearch: boolean }) {
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
          {isSearch ? '검색된 IP 주소' : 'Your Public IP Address'}
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
  const [searchInput, setSearchInput] = useState('')
  const [searchIp, setSearchIp] = useState<string | undefined>(undefined)

  const myIpKey = '/api/ip'
  const { data: myData, isLoading: myLoading } = useSWR<IpInfo>(
    myIpKey,
    (path: string) => apiGet<IpInfo>({ path }),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  )

  const searchKey = searchIp ? buildApiPath(searchIp) : null
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useSWR<IpInfo>(searchKey, (path: string) => apiGet<IpInfo>({ path }), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const wrapClass = 'w-full flex flex-1 flex-col items-center justify-center'

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = searchInput.trim()
    if (trimmed) setSearchIp(trimmed)
  }

  return (
    <div className={`${wrapClass} relative overflow-x-hidden gap-10 py-12`} data-testid='ip-page'>
      <div
        className='pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px]
                 bg-blue-500/10 rounded-full blur-[100px] sm:blur-[120px] -z-10'
      />

      {/* 내 IP 섹션 */}
      {myLoading || isNil(myData) ? (
        <IpPageSkeleton wrapClass='w-full max-w-[800px] mx-auto' />
      ) : (
        <IpResult data={myData} isSearch={false} />
      )}

      {/* IP 검색 섹션 */}
      <div className='mx-auto w-full max-w-[800px] flex flex-col gap-6'>
        <div className='flex items-center gap-2'>
          <Cpu className='w-4 h-4 text-purple-400' />
          <span className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
            IP 검색 / IP 찾기
          </span>
        </div>

        <form onSubmit={handleSearch} className='flex gap-2'>
          <input
            type='text'
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder='IP 주소를 입력하세요. 예: 8.8.8.8'
            className='flex-1 rounded-xl border border-white/10 bg-neutral-900/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-blue-500/50 transition-colors'
          />
          <button
            type='submit'
            disabled={!searchInput.trim()}
            className='inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium text-white transition-colors'
          >
            <Search className='w-3.5 h-3.5' />
            IP 찾기
          </button>
        </form>

        {searchLoading && (
          <IpPageSkeleton wrapClass='w-full' />
        )}

        {!searchLoading && searchError && (
          <div className='rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400'>
            유효한 IP 주소를 입력해 주세요.
          </div>
        )}

        {!searchLoading && !searchError && searchData && (
          <IpResult data={searchData} isSearch={true} />
        )}
      </div>
    </div>
  )
}
