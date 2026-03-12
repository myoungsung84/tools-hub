'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  MapPin,
  Navigation,
  Sun,
  Thermometer,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useSyncedNow } from '@/features/time/hook/use-synced-now'
import type { Coords } from '@/features/weather/types'
import { cn } from '@/lib/shared'

import {
  useWeatherHourlyByLocation,
  useWeatherNowByLocation,
  useWeatherNowMany,
  type WeatherLocation,
} from '../hook'

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const WEATHER_CITIES: WeatherLocation[] = [
  // 아시아
  {
    id: 'seoul',
    label: '서울',
    country: '대한민국',
    timezone: 'Asia/Seoul',
    coords: { latitude: 37.5665, longitude: 126.978 },
  },
  {
    id: 'busan',
    label: '부산',
    country: '대한민국',
    timezone: 'Asia/Seoul',
    coords: { latitude: 35.1796, longitude: 129.0756 },
  },
  {
    id: 'tokyo',
    label: '도쿄',
    country: '일본',
    timezone: 'Asia/Tokyo',
    coords: { latitude: 35.6764, longitude: 139.65 },
  },
  {
    id: 'osaka',
    label: '오사카',
    country: '일본',
    timezone: 'Asia/Tokyo',
    coords: { latitude: 34.6937, longitude: 135.5023 },
  },
  {
    id: 'beijing',
    label: '베이징',
    country: '중국',
    timezone: 'Asia/Shanghai',
    coords: { latitude: 39.9042, longitude: 116.4074 },
  },
  {
    id: 'shanghai',
    label: '상하이',
    country: '중국',
    timezone: 'Asia/Shanghai',
    coords: { latitude: 31.2304, longitude: 121.4737 },
  },
  {
    id: 'hong-kong',
    label: '홍콩',
    country: '홍콩',
    timezone: 'Asia/Hong_Kong',
    coords: { latitude: 22.3193, longitude: 114.1694 },
  },
  {
    id: 'singapore',
    label: '싱가포르',
    country: '싱가포르',
    timezone: 'Asia/Singapore',
    coords: { latitude: 1.3521, longitude: 103.8198 },
  },
  {
    id: 'bangkok',
    label: '방콕',
    country: '태국',
    timezone: 'Asia/Bangkok',
    coords: { latitude: 13.7563, longitude: 100.5018 },
  },
  {
    id: 'dubai',
    label: '두바이',
    country: '아랍에미리트',
    timezone: 'Asia/Dubai',
    coords: { latitude: 25.2048, longitude: 55.2708 },
  },
  {
    id: 'mumbai',
    label: '뭄바이',
    country: '인도',
    timezone: 'Asia/Kolkata',
    coords: { latitude: 19.076, longitude: 72.8777 },
  },
  // 유럽
  {
    id: 'london',
    label: '런던',
    country: '영국',
    timezone: 'Europe/London',
    coords: { latitude: 51.5074, longitude: -0.1278 },
  },
  {
    id: 'paris',
    label: '파리',
    country: '프랑스',
    timezone: 'Europe/Paris',
    coords: { latitude: 48.8566, longitude: 2.3522 },
  },
  {
    id: 'berlin',
    label: '베를린',
    country: '독일',
    timezone: 'Europe/Berlin',
    coords: { latitude: 52.52, longitude: 13.405 },
  },
  {
    id: 'rome',
    label: '로마',
    country: '이탈리아',
    timezone: 'Europe/Rome',
    coords: { latitude: 41.9028, longitude: 12.4964 },
  },
  {
    id: 'madrid',
    label: '마드리드',
    country: '스페인',
    timezone: 'Europe/Madrid',
    coords: { latitude: 40.4168, longitude: -3.7038 },
  },
  {
    id: 'amsterdam',
    label: '암스테르담',
    country: '네덜란드',
    timezone: 'Europe/Amsterdam',
    coords: { latitude: 52.3676, longitude: 4.9041 },
  },
  {
    id: 'moscow',
    label: '모스크바',
    country: '러시아',
    timezone: 'Europe/Moscow',
    coords: { latitude: 55.7558, longitude: 37.6173 },
  },
  // 아메리카
  {
    id: 'new-york',
    label: '뉴욕',
    country: '미국',
    timezone: 'America/New_York',
    coords: { latitude: 40.7128, longitude: -74.006 },
  },
  {
    id: 'los-angeles',
    label: 'LA',
    country: '미국',
    timezone: 'America/Los_Angeles',
    coords: { latitude: 34.0522, longitude: -118.2437 },
  },
  {
    id: 'chicago',
    label: '시카고',
    country: '미국',
    timezone: 'America/Chicago',
    coords: { latitude: 41.8781, longitude: -87.6298 },
  },
  {
    id: 'toronto',
    label: '토론토',
    country: '캐나다',
    timezone: 'America/Toronto',
    coords: { latitude: 43.6532, longitude: -79.3832 },
  },
  {
    id: 'sao-paulo',
    label: '상파울루',
    country: '브라질',
    timezone: 'America/Sao_Paulo',
    coords: { latitude: -23.5505, longitude: -46.6333 },
  },
  {
    id: 'mexico-city',
    label: '멕시코시티',
    country: '멕시코',
    timezone: 'America/Mexico_City',
    coords: { latitude: 19.4326, longitude: -99.1332 },
  },
  // 오세아니아 · 아프리카
  {
    id: 'sydney',
    label: '시드니',
    country: '호주',
    timezone: 'Australia/Sydney',
    coords: { latitude: -33.8688, longitude: 151.2093 },
  },
  {
    id: 'cairo',
    label: '카이로',
    country: '이집트',
    timezone: 'Africa/Cairo',
    coords: { latitude: 30.0444, longitude: 31.2357 },
  },
  {
    id: 'johannesburg',
    label: '요하네스버그',
    country: '남아프리카',
    timezone: 'Africa/Johannesburg',
    coords: { latitude: -26.2041, longitude: 28.0473 },
  },
]

/** 상단 탭에 고정 노출할 주요 거점 도시 ID */
const PINNED_CITY_IDS = ['seoul', 'tokyo', 'singapore', 'london', 'new-york', 'sydney'] as const

function formatLocalTime(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
}

function formatTimeLabel(time: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(time)
}

/** 차트 X축용: "PM 8시" / "AM 2시" 형식 */
function formatChartTime(time: Date, timeZone: string): string {
  const hour = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hour12: false }).format(time),
    10
  )
  const ampm = hour < 12 ? 'AM' : 'PM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${ampm} ${h}시`
}

function formatCoord(coords: Coords): string {
  const lat =
    coords.latitude >= 0
      ? `N ${coords.latitude.toFixed(2)}`
      : `S ${Math.abs(coords.latitude).toFixed(2)}`
  const lon =
    coords.longitude >= 0
      ? `E ${coords.longitude.toFixed(2)}`
      : `W ${Math.abs(coords.longitude).toFixed(2)}`
  return `${lat} · ${lon}`
}

function tempColorClass(tempC: number | null | undefined): string {
  if (tempC == null) return 'text-white/90'
  if (tempC >= 35) return 'text-red-400'
  if (tempC >= 28) return 'text-orange-400'
  if (tempC >= 20) return 'text-yellow-300'
  if (tempC >= 10) return 'text-emerald-400'
  if (tempC >= 0) return 'text-sky-300'
  return 'text-blue-400'
}

/** 날씨 label 키워드 → 아이콘 컴포넌트 + 색상 클래스 */
function weatherMeta(label: string | null | undefined): {
  Icon: LucideIcon
  colorClass: string
} {
  const t = label?.toLowerCase() ?? ''
  if (t.includes('뇌우') || t.includes('번개'))
    return { Icon: CloudLightning, colorClass: 'text-yellow-300' }
  if (t.includes('눈') || t.includes('snow')) return { Icon: CloudSnow, colorClass: 'text-sky-200' }
  if (t.includes('비') || t.includes('rain') || t.includes('소나기'))
    return { Icon: CloudRain, colorClass: 'text-sky-400' }
  if (t.includes('이슬') || t.includes('drizzle'))
    return { Icon: CloudDrizzle, colorClass: 'text-sky-300' }
  if (t.includes('흐림') || t.includes('cloud') || t.includes('구름'))
    return { Icon: Cloud, colorClass: 'text-white/50' }
  if (t.includes('맑음') || t.includes('clear') || t.includes('sunny'))
    return { Icon: Sun, colorClass: 'text-white/50' }
  return { Icon: CloudSun, colorClass: 'text-white/40' }
}

/** 기온 + 날씨 조건 → 한 줄 체감 코멘트 */
function weatherComment(
  tempC: number | null | undefined,
  label: string | null | undefined
): string | null {
  if (tempC == null) return null
  const t = label?.toLowerCase() ?? ''

  const hasRain = t.includes('비') || t.includes('rain') || t.includes('소나기')
  const hasSnow = t.includes('눈') || t.includes('snow')
  const hasThunder = t.includes('뇌우') || t.includes('번개')
  const hasDrizzle = t.includes('이슬') || t.includes('drizzle')
  const hasCloudy = t.includes('흐림') || t.includes('cloud') || t.includes('구름')
  const hasClear = t.includes('맑음') || t.includes('clear') || t.includes('sunny')

  if (hasThunder) return '천둥번개가 예상돼요. 외출을 자제하세요'
  if (hasSnow && tempC <= -5) return '폭설 주의! 빙판길에 각별히 조심하세요'
  if (hasSnow) return '눈이 내려요. 미끄럼에 주의하세요'
  if (hasRain && tempC <= 5) return '차가운 비가 내려요. 우산을 꼭 챙기세요'
  if (hasRain) return '비가 오고 있어요. 우산을 준비하세요'
  if (hasDrizzle) return '가랑비가 내려요. 가벼운 우산이 있으면 좋아요'

  if (tempC >= 35) return '매우 더워요. 야외 활동 시 충분한 수분을 섭취하세요'
  if (tempC >= 30) return '더운 날씨예요. 시원한 곳에 머무르는 게 좋아요'
  if (tempC >= 25 && hasClear) return '따뜻하고 화창해요. 나들이하기 딱 좋은 날이에요'
  if (tempC >= 20 && hasClear) return '선선하고 맑아요. 야외 활동하기 좋아요'
  if (tempC >= 20) return '활동하기 좋은 기온이에요'
  if (tempC >= 15 && hasCloudy) return '선선하고 흐린 날씨예요. 가벼운 겉옷을 챙기세요'
  if (tempC >= 15) return '약간 선선해요. 얇은 겉옷을 챙기면 좋아요'
  if (tempC >= 10) return '쌀쌀한 날씨예요. 겉옷을 챙기세요'
  if (tempC >= 5) return '꽤 춥네요. 따뜻하게 입고 나가세요'
  if (tempC >= 0) return '매우 쌀쌀해요. 두꺼운 외투가 필요해요'
  if (tempC >= -10) return '영하의 날씨예요. 방한에 신경 쓰세요'
  return '혹한이에요. 가급적 실내에 머무르세요'
}

interface StatTileProps {
  label: string
  value: string
  shimmer?: boolean
}

function StatTile({ label, value, shimmer = false }: StatTileProps) {
  return (
    <div className='rounded-xl border border-white/8 bg-white/4 px-3 py-2.5'>
      <p className='text-[10px] uppercase tracking-widest text-white/35'>{label}</p>
      {shimmer ? (
        <div className='mt-1.5 h-4 w-14 animate-pulse rounded bg-white/10' />
      ) : (
        <p className='mt-1 truncate text-sm font-medium tabular-nums text-white/80'>{value}</p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Chart helpers
// ─────────────────────────────────────────────

interface CustomDotProps {
  cx?: number
  cy?: number
  value?: number | [number, number]
  index?: number
  color: string
  unit: string
  total: number
}

function CustomDotWithLabel({
  cx = 0,
  cy = 0,
  value,
  index = 0,
  color,
  unit,
  total,
}: CustomDotProps) {
  if (value == null) return null
  const displayValue = Array.isArray(value) ? value[1] : value
  if (displayValue == null) return null
  // 첫 번째와 마지막은 레이블이 잘릴 수 있으므로 anchor 조정
  const anchor = index === 0 ? 'start' : index === total - 1 ? 'end' : 'middle'
  return (
    <g>
      <circle cx={cx} cy={cy} r={3} fill={color} />
      <text
        x={cx}
        y={cy - 8}
        textAnchor={anchor}
        fill='rgba(255,255,255,0.8)'
        fontSize={10}
        fontWeight={500}
      >
        {displayValue}
        {unit}
      </text>
    </g>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function WeatherPage() {
  const [selectedCityId, setSelectedCityId] = useState<string>(WEATHER_CITIES[0]?.id ?? 'seoul')
  // fade: 콘텐츠 노출 여부 (false = 투명, true = 보임)
  const [visible, setVisible] = useState(true)
  const [chartTab, setChartTab] = useState<'temp' | 'precip' | 'wind'>('temp')
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSelectCity = (id: string) => {
    if (id === selectedCityId) return
    // 1) 페이드 아웃
    setVisible(false)
    // 2) 짧은 딜레이 후 도시 전환 → 새 데이터 fetch 시작
    fadeTimerRef.current = setTimeout(() => {
      setSelectedCityId(id)
    }, 150)
  }

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  const selectedCity = useMemo<WeatherLocation | null>(
    () => WEATHER_CITIES.find(city => city.id === selectedCityId) ?? WEATHER_CITIES[0] ?? null,
    [selectedCityId]
  )

  const now = useSyncedNow()

  const subCities = useMemo<WeatherLocation[]>(
    () => WEATHER_CITIES.filter(city => city.id !== selectedCity?.id),
    [selectedCity]
  )

  const { data: mainNow, loading: mainNowLoading } = useWeatherNowByLocation(selectedCity)
  const { data: mainHourly, loading: mainHourlyLoading } = useWeatherHourlyByLocation(
    selectedCity,
    24
  )
  const { data: subNowMap, loading: subLoading } = useWeatherNowMany(subCities)

  // 새 도시 데이터가 도착하면 페이드 인
  useEffect(() => {
    if (!mainNowLoading) {
      // 살짝 딜레이 주어 레이아웃 점프 방지
      const t = setTimeout(() => setVisible(true), 30)
      return () => clearTimeout(t)
    }
  }, [mainNowLoading, selectedCityId])

  const hourlyItems = useMemo(() => mainHourly?.points.slice(0, 12) ?? [], [mainHourly?.points])

  const isLoading = mainNowLoading || !mainNow

  const pinnedCities = useMemo(
    () => WEATHER_CITIES.filter(c => (PINNED_CITY_IDS as readonly string[]).includes(c.id)),
    []
  )

  if (!selectedCity) return null

  return (
    <div className='flex w-full min-w-0 flex-col gap-4'>
      {/* ── 메인 섹션 ── */}
      <section className='overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_16px_48px_rgba(0,0,0,0.28)] backdrop-blur-md'>
        {/* 주요 거점 탭 — 스크롤 없이 균등 배치 */}
        <nav
          className='grid border-b border-white/8 px-1 py-1.5'
          style={{ gridTemplateColumns: `repeat(${pinnedCities.length}, 1fr)` }}
          aria-label='주요 도시'
        >
          {pinnedCities.map(city => (
            <button
              key={city.id}
              type='button'
              onClick={() => handleSelectCity(city.id)}
              aria-pressed={city.id === selectedCityId}
              className={cn(
                'rounded-lg py-1.5 text-xs font-medium transition-all duration-200',
                city.id === selectedCityId
                  ? 'bg-white/12 text-white/95 ring-1 ring-inset ring-white/15'
                  : 'text-white/40 hover:bg-white/6 hover:text-white/70'
              )}
            >
              {city.label}
            </button>
          ))}
        </nav>

        {/*
          핵심: 높이를 고정하지 않고 opacity + translate 로만 전환
          → 레이아웃 점프 없이 부드럽게 fade
        */}
        <div
          className={cn(
            'flex flex-col transition-all duration-300 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
          )}
        >
          {/* ── 현재 기온 ── */}
          <div className='border-b border-white/8'>
            {/* 배경 그라디언트 레이어 */}
            <div className='relative overflow-hidden px-5 py-6'>
              {/* 기온에 따른 subtle 배경 tint */}
              <div
                className={cn(
                  'pointer-events-none absolute inset-0 opacity-[0.04]',
                  mainNow?.tempC != null && mainNow.tempC >= 28
                    ? 'bg-gradient-to-br from-orange-400 to-transparent'
                    : mainNow?.tempC != null && mainNow.tempC <= 0
                      ? 'bg-gradient-to-br from-blue-400 to-transparent'
                      : 'bg-gradient-to-br from-white to-transparent'
                )}
              />

              {/* 1행: 좌 — 도시 정보 / 우 — 현지 시각 */}
              <div className='flex items-start justify-between gap-4'>
                <div className='min-w-0'>
                  <div className='flex items-center gap-1 text-[10px] text-white/30'>
                    <MapPin className='h-3 w-3 shrink-0' />
                    <span className='truncate'>{formatCoord(selectedCity.coords)}</span>
                  </div>
                  <h2 className='mt-1 truncate text-2xl font-bold tracking-tight text-white/90'>
                    {selectedCity.label}
                  </h2>
                  <p className='mt-0.5 text-xs text-white/40'>{selectedCity.country}</p>
                </div>

                <div className='shrink-0 text-right'>
                  <p className='text-[10px] text-white/30'>현지 시각</p>
                  <p className='mt-0.5 text-xl font-light tabular-nums text-white/70'>
                    {now ? formatLocalTime(now, selectedCity.timezone) : '--:--'}
                  </p>
                </div>
              </div>

              {/* 2행: 기온 + 날씨 레이블 + 코멘트 */}
              <div className='mt-5 flex items-end gap-4'>
                {isLoading ? (
                  <>
                    <div className='h-16 w-28 animate-pulse rounded-xl bg-white/8' />
                    <div className='space-y-2 pb-1'>
                      <div className='h-3.5 w-16 animate-pulse rounded bg-white/8' />
                      <div className='h-3 w-36 animate-pulse rounded bg-white/5' />
                    </div>
                  </>
                ) : (
                  <>
                    <div className='flex items-start gap-2'>
                      <p
                        className={cn(
                          'text-7xl font-extralight tabular-nums leading-none',
                          tempColorClass(mainNow?.tempC)
                        )}
                      >
                        {mainNow?.tempC != null ? `${mainNow.tempC}` : '--'}
                      </p>
                      <span
                        className={cn('mt-1 text-3xl font-thin', tempColorClass(mainNow?.tempC))}
                      >
                        °
                      </span>
                    </div>

                    <div className='min-w-0 pb-1'>
                      {/* 날씨 상태 뱃지 */}
                      <div className='flex items-center gap-1.5'>
                        {(() => {
                          const { Icon, colorClass } = weatherMeta(mainNow?.label)
                          return <Icon className={cn('h-3.5 w-3.5 shrink-0', colorClass)} />
                        })()}
                        <p className='text-sm font-medium text-white/70'>
                          {mainNow?.label ?? '정보 없음'}
                        </p>
                      </div>
                      {weatherComment(mainNow?.tempC, mainNow?.label) && (
                        <p className='mt-1.5 text-[11px] leading-relaxed text-white/45'>
                          {weatherComment(mainNow?.tempC, mainNow?.label)}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* 3행: 상세 지표 */}
              <div className='mt-5 grid grid-cols-2 gap-1.5 sm:grid-cols-4'>
                <StatTile
                  label='체감온도'
                  value={mainNow?.feelsLikeC != null ? `${mainNow.feelsLikeC}°C` : '-'}
                  shimmer={isLoading}
                />
                <StatTile
                  label='바람'
                  value={mainNow?.windMs != null ? `${mainNow.windMs} m/s` : '-'}
                  shimmer={isLoading}
                />
                <StatTile
                  label='시간대'
                  value={
                    selectedCity.timezone.split('/')[1]?.replace('_', ' ') ?? selectedCity.timezone
                  }
                />
                <StatTile
                  label='갱신'
                  value={mainNow ? formatTimeLabel(mainNow.fetchedAt, selectedCity.timezone) : '-'}
                  shimmer={isLoading}
                />
              </div>
            </div>
          </div>

          {/* ── 12시간 예보 차트 ── */}
          <div className='px-5 pb-5 pt-4'>
            {/* 탭 범례 — 네이버 스타일 */}
            <div className='mb-4 flex items-center gap-5 border-b border-white/8 pb-3'>
              {(
                [
                  { key: 'temp', label: '기온', color: '#f59e0b' },
                  { key: 'precip', label: '강수확률', color: '#38bdf8' },
                  { key: 'wind', label: '바람', color: '#a3e635' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.key}
                  type='button'
                  onClick={() => setChartTab(tab.key)}
                  className='group flex flex-col items-start gap-1.5'
                >
                  <span
                    className={cn(
                      'text-xs font-medium transition-colors',
                      chartTab === tab.key
                        ? 'text-white/90'
                        : 'text-white/35 group-hover:text-white/60'
                    )}
                  >
                    {tab.label}
                  </span>
                  <span
                    className='h-0.5 w-full rounded-full transition-opacity'
                    style={{
                      background: tab.color,
                      opacity: chartTab === tab.key ? 1 : 0,
                    }}
                  />
                </button>
              ))}
            </div>

            {isLoading || mainHourlyLoading || hourlyItems.length === 0 ? (
              <div className='flex h-[170px] animate-pulse items-end gap-1 rounded-xl bg-white/4 px-4 pb-4 pt-6'>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className='flex-1 rounded-sm bg-white/8'
                    style={{ height: `${30 + Math.sin(i * 0.8) * 20 + 20}%` }}
                  />
                ))}
              </div>
            ) : (
              <ResponsiveContainer width='100%' height={170}>
                <AreaChart
                  data={hourlyItems.map(p => ({
                    time: formatChartTime(p.time, selectedCity.timezone),
                    temp: p.temperature,
                    precip: p.precipitationProbability ?? 0,
                    wind: p.windSpeed ?? 0,
                  }))}
                  margin={{ top: 28, right: 16, left: 16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id='gradTemp' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor='rgba(245,158,11,0.35)' />
                      <stop offset='100%' stopColor='rgba(245,158,11,0)' />
                    </linearGradient>
                    <linearGradient id='gradPrecip' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor='rgba(56,189,248,0.35)' />
                      <stop offset='100%' stopColor='rgba(56,189,248,0)' />
                    </linearGradient>
                    <linearGradient id='gradWind' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor='rgba(163,230,53,0.35)' />
                      <stop offset='100%' stopColor='rgba(163,230,53,0)' />
                    </linearGradient>
                  </defs>

                  {/* X축: 2개 간격으로 심플하게 */}
                  <XAxis
                    dataKey='time'
                    tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={1}
                  />

                  <YAxis yAxisId='temp' domain={['dataMin - 1', 'dataMax + 10']} hide />
                  <YAxis yAxisId='precip' domain={[0, 150]} hide />
                  <YAxis yAxisId='wind' domain={[0, 'dataMax + 6']} hide />

                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,10,15,0.92)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.8)',
                      padding: '6px 10px',
                    }}
                    cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
                    formatter={(value, name) => {
                      const numericValue =
                        typeof value === 'number' ? value : Number(value != null ? value : 0)
                      const dataKey = String(name)

                      if (dataKey === 'temp') return [`${numericValue}°`, '기온']
                      if (dataKey === 'precip') return [`${numericValue}%`, '강수확률']
                      return [`${numericValue} m/s`, '바람']
                    }}
                  />

                  {/* 기온 */}
                  {chartTab === 'temp' && (
                    <Area
                      yAxisId='temp'
                      type='monotone'
                      dataKey='temp'
                      stroke='#f59e0b'
                      strokeWidth={2}
                      fill='url(#gradTemp)'
                      activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
                      dot={props => (
                        <CustomDotWithLabel
                          key={`dot-temp-${props.index}`}
                          {...props}
                          color='#f59e0b'
                          unit='°'
                          total={hourlyItems.length}
                        />
                      )}
                    />
                  )}

                  {/* 강수확률 */}
                  {chartTab === 'precip' && (
                    <Area
                      yAxisId='precip'
                      type='monotone'
                      dataKey='precip'
                      stroke='#38bdf8'
                      strokeWidth={2}
                      fill='url(#gradPrecip)'
                      activeDot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }}
                      dot={props => (
                        <CustomDotWithLabel
                          key={`dot-precip-${props.index}`}
                          {...props}
                          color='#38bdf8'
                          unit='%'
                          total={hourlyItems.length}
                        />
                      )}
                    />
                  )}

                  {/* 바람 */}
                  {chartTab === 'wind' && (
                    <Area
                      yAxisId='wind'
                      type='monotone'
                      dataKey='wind'
                      stroke='#a3e635'
                      strokeWidth={2}
                      fill='url(#gradWind)'
                      activeDot={{ r: 4, fill: '#a3e635', strokeWidth: 0 }}
                      dot={props => (
                        <CustomDotWithLabel
                          key={`dot-wind-${props.index}`}
                          {...props}
                          color='#a3e635'
                          unit='m'
                          total={hourlyItems.length}
                        />
                      )}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* ── 다른 도시 ── */}
      <section className='overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-md'>
        <div className='border-b border-white/8 px-5 py-3'>
          <p className='text-[10px] font-semibold uppercase tracking-[0.25em] text-white/35'>
            전 세계 도시
          </p>
        </div>

        <div className='grid grid-cols-1 divide-y divide-white/8 sm:grid-cols-2 lg:grid-cols-3'>
          {subCities.map(city => {
            const weather = subNowMap[city.id]
            const cityLoading = subLoading && !weather
            const { Icon: WeatherIcon, colorClass: weatherColor } = weatherMeta(weather?.label)

            return (
              <button
                key={city.id}
                type='button'
                onClick={() => handleSelectCity(city.id)}
                className={cn(
                  'group min-w-0 px-5 py-4 text-left transition-colors duration-150',
                  'hover:bg-white/4 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-1 focus-visible:ring-white/20',
                  // 깔끔한 divide: sm 2열 우측 열 left border, lg 3열 2·3번째 열 left border
                  'sm:odd:border-r sm:odd:border-white/8',
                  'lg:odd:border-r-0',
                  'lg:[&:nth-child(3n+2)]:border-l lg:[&:nth-child(3n+2)]:border-r lg:[&:nth-child(3n+2)]:border-white/8',
                  'lg:[&:nth-child(3n)]:border-l lg:[&:nth-child(3n)]:border-white/8'
                )}
              >
                {/* 도시명 + 아이콘 */}
                <div className='flex items-start justify-between gap-2'>
                  <div className='min-w-0'>
                    <p className='min-w-0 truncate text-sm font-medium text-white/80 transition-colors group-hover:text-white/95'>
                      {city.label}
                    </p>
                    <p className='mt-0.5 text-[10px] tabular-nums text-white/35'>
                      {now ? formatLocalTime(now, city.timezone) : '--:--'} · {city.country}
                    </p>
                  </div>
                  {!cityLoading && (
                    <WeatherIcon className={cn('mt-0.5 h-4 w-4 shrink-0', weatherColor)} />
                  )}
                </div>

                {/* 기온 + 날씨 */}
                <div className='mt-3 flex items-end justify-between gap-2'>
                  {cityLoading ? (
                    <div className='h-7 w-12 animate-pulse rounded-md bg-white/8' />
                  ) : (
                    <p
                      className={cn(
                        'text-2xl font-light tabular-nums leading-none',
                        tempColorClass(weather?.tempC)
                      )}
                    >
                      {weather != null ? `${weather.tempC}°` : '--°'}
                    </p>
                  )}
                  <p
                    className={cn(
                      'min-w-0 truncate text-[11px]',
                      cityLoading ? 'text-transparent' : weatherColor
                    )}
                  >
                    {weather?.label ?? '—'}
                  </p>
                </div>

                {/* 체감 코멘트 */}
                {!cityLoading && weatherComment(weather?.tempC, weather?.label) && (
                  <p className='mt-1.5 line-clamp-1 text-[10px] text-white/40'>
                    {weatherComment(weather?.tempC, weather?.label)}
                  </p>
                )}

                {/* 체감 + 풍속 */}
                <div className='mt-2 flex items-center gap-3 text-[10px] text-white/30'>
                  <span className='inline-flex items-center gap-1'>
                    <Thermometer className='h-3 w-3 shrink-0' />
                    체감 {weather?.feelsLikeC != null ? `${weather.feelsLikeC}°` : '-'}
                  </span>
                  <span className='inline-flex items-center gap-1'>
                    <Navigation className='h-3 w-3 shrink-0' />
                    {weather?.windMs != null ? `${weather.windMs} m/s` : '-'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
