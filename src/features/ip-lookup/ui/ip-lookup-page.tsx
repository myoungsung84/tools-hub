'use client'

import { isNil } from 'lodash-es'
import { AlertCircle, FileSearch } from 'lucide-react'
import { FormEvent, useMemo, useRef, useState } from 'react'

import PageHeader from '@/components/layout/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/client'
import { ApiClientError } from '@/lib/client/api-client'

import { lookupIp } from '../lib/ip-lookup.api'
import { NOTE_PRIMARY, NOTE_SECONDARY } from '../lib/ip-lookup.constants'
import type { LookupState } from '../lib/ip-lookup.types'
import IpLookupFormCard from './components/ip-lookup-form-card'
import IpLookupLocationCard from './components/ip-lookup-location-card'
import IpLookupMapCard from './components/ip-lookup-map-card'
import IpLookupPlaceholder from './components/ip-lookup-placeholder'
import IpLookupSummaryCard from './components/ip-lookup-summary-card'

export default function IpLookupPage() {
  const [ipInput, setIpInput] = useState('')
  const [state, setState] = useState<LookupState>({ status: 'idle' })
  const inputRef = useRef<HTMLInputElement>(null)

  const lookupData = state.status === 'success' ? state.data : null
  const isLoading = state.status === 'loading'

  const hasMapCoords =
    lookupData?.isPrivate === false && !isNil(lookupData.geo?.lat) && !isNil(lookupData.geo?.lon)

  const mapUrl = useMemo(() => {
    if (!hasMapCoords) return null
    const geo = lookupData?.geo
    if (!geo || geo.lat == null || geo.lon == null) return null
    const { lat, lon } = geo
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.25}%2C${lat - 0.25}%2C${lon + 0.25}%2C${lat + 0.25}&layer=mapnik&marker=${lat}%2C${lon}`
  }, [hasMapCoords, lookupData?.geo])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const ip = ipInput.trim()

    if (!ip) {
      setState({ status: 'error', message: 'IP 주소를 입력해 주세요.' })
      inputRef.current?.focus()
      return
    }

    setState({ status: 'loading' })

    try {
      const data = await lookupIp(ip)
      setState({ status: 'success', data })
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'IP 조회 중 오류가 발생했습니다.'
      setState({ status: 'error', message })
    }
  }

  return (
    <div className={cn('w-full')}>
      <PageHeader
        icon={FileSearch}
        kicker='아이피 검색'
        title='IP 주소로 위치와 ASN 정보를 조회하세요'
        description='공인 IP 또는 IPv6 주소를 입력해 대략적인 위치와 네트워크 정보를 확인합니다.'
      />

      <div className='flex w-full flex-col'>
        <div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start'>
          <IpLookupFormCard
            ipInput={ipInput}
            isLoading={isLoading}
            inputRef={inputRef}
            onChange={setIpInput}
            onSubmit={onSubmit}
          />

          {state.status === 'error' && (
            <Alert variant='destructive' className='lg:col-span-2' data-testid='ip-lookup-error'>
              <AlertCircle />
              <AlertTitle>조회 실패</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {lookupData ? (
            <>
              <IpLookupSummaryCard data={lookupData} />
              <IpLookupLocationCard data={lookupData} />
              <IpLookupMapCard data={lookupData} hasMapCoords={hasMapCoords} mapUrl={mapUrl} />

              <Separator className='lg:col-span-2' />

              <p className='text-xs leading-relaxed text-muted-foreground/70 lg:col-span-2'>
                {NOTE_PRIMARY} {NOTE_SECONDARY}
              </p>
            </>
          ) : state.status === 'idle' ? (
            <IpLookupPlaceholder />
          ) : null}
        </div>
      </div>
    </div>
  )
}
