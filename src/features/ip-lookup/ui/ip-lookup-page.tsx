'use client'

import { isNil } from 'lodash-es'
import { AlertCircle, FileSearch, Loader2, LocateFixed, MapPin, Search } from 'lucide-react'
import { FormEvent, useMemo, useRef, useState } from 'react'

import PageHeader from '@/components/layout/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/client'
import { ApiClientError, apiPost } from '@/lib/client/api-client'

type IpLookupData = {
  ip: string
  isPrivate: boolean
  geo: {
    country: string | null
    countryName: string | null
    region: string | null
    city: string | null
    lat: number | null
    lon: number | null
    timezone: string | null
    accuracyRadiusKm: number | null
    updatedText: string | null
  } | null
  asn: {
    asn: number | null
    org: string | null
    updatedText: string | null
  } | null
}

const UNKNOWN = '—'

function ResultRow({ label, value }: { label: string; value: string }) {
  const isEmpty = value === UNKNOWN
  return (
    <div className='flex flex-col gap-1.5 rounded-lg border border-border/50 bg-muted/20 px-4 py-3'>
      <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
        {label}
      </p>
      <p
        className={cn(
          'break-all text-sm font-medium leading-snug',
          isEmpty ? 'text-muted-foreground/40' : 'text-foreground'
        )}
      >
        {value}
      </p>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className='flex h-full min-h-[64px] items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/10 px-4 py-3'>
      <p className='text-sm text-muted-foreground/50'>{message}</p>
    </div>
  )
}

type LookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: IpLookupData }

export default function IpLookupPage() {
  const [ipInput, setIpInput] = useState('')
  const [state, setState] = useState<LookupState>({ status: 'idle' })
  const inputRef = useRef<HTMLInputElement>(null)

  const lookupData = state.status === 'success' ? state.data : null

  const hasMapCoords =
    lookupData?.isPrivate === false && !isNil(lookupData.geo?.lat) && !isNil(lookupData.geo?.lon)

  const mapUrl = useMemo(() => {
    if (!hasMapCoords || !lookupData?.geo?.lat || !lookupData.geo.lon) return null
    const { lat, lon } = lookupData.geo
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.25}%2C${lat - 0.25}%2C${lon + 0.25}%2C${lat + 0.25}&layer=mapnik&marker=${lat}%2C${lon}`
  }, [hasMapCoords, lookupData?.geo?.lat, lookupData?.geo?.lon])

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
      const res = await apiPost<IpLookupData>({
        path: '/api/ip',
        body: { ip },
      })
      setState({ status: 'success', data: res })
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'IP 조회 중 오류가 발생했습니다.'
      setState({ status: 'error', message })
    }
  }

  const isLoading = state.status === 'loading'

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
          {/* 입력 폼 */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>IP 주소 조회</CardTitle>
              <CardDescription>
                IPv4 또는 IPv6 주소를 입력하세요. 사설 IP는 위치 정보를 제공하지 않습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className='flex flex-col gap-2 sm:flex-row'>
                <Input
                  ref={inputRef}
                  value={ipInput}
                  onChange={e => setIpInput(e.target.value)}
                  placeholder='예: 8.8.8.8  ·  2001:4860:4860::8888'
                  className='flex-1 font-mono'
                  disabled={isLoading}
                  aria-label='IP 주소 입력'
                />
                <Button type='submit' disabled={isLoading} className='shrink-0'>
                  {isLoading ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : (
                    <Search className='size-4' />
                  )}
                  {isLoading ? '조회 중...' : '조회하기'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 에러 */}
          {state.status === 'error' && (
            <Alert variant='destructive' className='lg:col-span-2'>
              <AlertCircle />
              <AlertTitle>조회 실패</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {lookupData ? (
            <>
              {/* 요약 카드 */}
              <Card className='lg:col-span-2'>
                <CardHeader>
                  <CardTitle>요약</CardTitle>
                </CardHeader>
                <CardContent className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
                  <div className='rounded-lg border border-border/50 bg-muted/20 px-4 py-3'>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
                      IP 주소
                    </p>
                    <p className='mt-1.5 break-all font-mono text-sm font-semibold'>
                      {lookupData.ip}
                    </p>
                  </div>
                  <div className='rounded-lg border border-border/50 bg-muted/20 px-4 py-3'>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
                      유형
                    </p>
                    <p className='mt-1.5 break-all font-mono text-sm font-semibold'>
                      {lookupData.isPrivate ? '사설 (Private)' : '공인 (Public)'}
                    </p>
                  </div>
                  <div className='rounded-lg border border-border/50 bg-muted/20 px-4 py-3'>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
                      국가
                    </p>
                    <p className='mt-1.5 text-sm font-medium'>
                      {lookupData.geo?.countryName
                        ? `${lookupData.geo.countryName}${lookupData.geo.country ? ` (${lookupData.geo.country})` : ''}`
                        : UNKNOWN}
                    </p>
                  </div>
                  <div className='rounded-lg border border-border/50 bg-muted/20 px-4 py-3'>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
                      ASN
                    </p>
                    <p className='mt-1.5 text-sm font-medium'>
                      {lookupData.asn?.asn != null ? `AS${lookupData.asn.asn}` : UNKNOWN}
                    </p>
                  </div>
                  <div className='rounded-lg border border-border/50 bg-muted/20 px-4 py-3'>
                    <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
                      네트워크 사업자 (ISP)
                    </p>
                    <p className='mt-1.5 text-sm font-medium'>{lookupData.asn?.org ?? UNKNOWN}</p>
                  </div>
                </CardContent>
              </Card>

              {/* 위치 상세 */}
              <Card className='flex h-full flex-col lg:col-span-2'>
                <CardHeader>
                  <CardTitle>위치 정보</CardTitle>
                  <CardDescription>GeoIP 데이터베이스 기반 추정 위치</CardDescription>
                </CardHeader>
                <CardContent className='grid flex-1 auto-rows-fr gap-2.5 sm:grid-cols-2'>
                  {lookupData.geo ? (
                    <>
                      <ResultRow label='국가 코드' value={lookupData.geo.country ?? UNKNOWN} />
                      <ResultRow label='국가' value={lookupData.geo.countryName ?? UNKNOWN} />
                      <ResultRow label='지역 / 주' value={lookupData.geo.region ?? UNKNOWN} />
                      <ResultRow label='도시' value={lookupData.geo.city ?? UNKNOWN} />
                      <ResultRow
                        label='위도 (Latitude)'
                        value={lookupData.geo.lat?.toString() ?? UNKNOWN}
                      />
                      <ResultRow
                        label='경도 (Longitude)'
                        value={lookupData.geo.lon?.toString() ?? UNKNOWN}
                      />
                      <ResultRow label='시간대' value={lookupData.geo.timezone ?? UNKNOWN} />
                      <ResultRow
                        label='위치 정확도 반경'
                        value={
                          lookupData.geo.accuracyRadiusKm != null
                            ? `약 ${lookupData.geo.accuracyRadiusKm}km 이내`
                            : UNKNOWN
                        }
                      />
                      <div className='sm:col-span-2'>
                        <ResultRow
                          label='데이터 갱신일'
                          value={lookupData.geo.updatedText ?? UNKNOWN}
                        />
                      </div>
                    </>
                  ) : (
                    <div className='sm:col-span-2'>
                      <EmptyState message='위치 정보를 가져올 수 없습니다.' />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 지도 or 사설 IP 안내 */}
              {lookupData.isPrivate ? (
                <Alert className='lg:col-span-2'>
                  <LocateFixed />
                  <AlertTitle>사설 IP 주소</AlertTitle>
                  <AlertDescription>
                    입력하신 주소는 사설 네트워크 대역(Private)에 속합니다. 인터넷상의 위치 정보가
                    없어 지도를 표시할 수 없습니다.
                  </AlertDescription>
                </Alert>
              ) : hasMapCoords ? (
                <Card className='lg:col-span-2'>
                  <CardHeader>
                    <div className='flex items-center gap-2'>
                      <MapPin className='size-4 text-muted-foreground' />
                      <CardTitle>지도</CardTitle>
                    </div>
                    <CardDescription>
                      위도 {lookupData.geo?.lat} · 경도 {lookupData.geo?.lon}
                      {lookupData.geo?.accuracyRadiusKm != null &&
                        ` · 정확도 반경 약 ${lookupData.geo.accuracyRadiusKm}km`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='overflow-hidden rounded-xl border border-border/60 shadow-sm'>
                      {mapUrl ? (
                        <iframe
                          title='ip-lookup-map'
                          src={mapUrl}
                          className='h-80 w-full'
                          loading='lazy'
                          referrerPolicy='no-referrer-when-downgrade'
                        />
                      ) : (
                        <div className='flex h-72 items-center justify-center text-sm text-muted-foreground'>
                          지도를 불러오는 중입니다...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <Separator className='lg:col-span-2' />

              {/* 주의사항 */}
              <p className='text-xs leading-relaxed text-muted-foreground/70 lg:col-span-2'>
                IP 기반 위치는 실제 위치와 다를 수 있습니다. VPN·프록시 사용 시 또는 통신사·ASN
                정책에 따라 부정확할 수 있습니다.
              </p>
            </>
          ) : state.status === 'idle' ? (
            <>
              <Card className='lg:col-span-2 border-dashed border-border/60 bg-muted/10'>
                <CardHeader>
                  <CardTitle>아직 조회한 결과가 없어요</CardTitle>
                  <CardDescription>
                    IP 주소를 입력하면 위치 정보, ASN, 추정 지도를 이 자리에서 바로 확인할 수
                    있습니다.
                  </CardDescription>
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
                    조회 후에는 아래 영역에 국가, 지역, 도시, 좌표, 위치 정확도 반경 정보가
                    표시됩니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className='grid gap-2.5 sm:grid-cols-2'>
                  <EmptyState message='조회 전에는 위치 정보가 여기에 표시됩니다.' />
                  <EmptyState message='공인 IP라면 지도도 함께 표시됩니다.' />
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
