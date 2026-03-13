'use client'

import { MapPin, Navigation, Thermometer } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useSyncedNow } from '@/features/time/hook/use-synced-now'
import { CHART_TABS, PINNED_CITY_IDS, WEATHER_CITIES } from '@/features/weather/constants'
import {
  formatChartTime,
  formatCoord,
  formatLocalTime,
  formatTimeLabel,
  tempColorClass,
  weatherComment,
  weatherMeta,
} from '@/features/weather/lib'
import type { WeatherHourlyPoint, WeatherNow } from '@/features/weather/types'
import { cn } from '@/lib/shared'

import {
  useWeatherHourlyByLocation,
  useWeatherNowByLocation,
  useWeatherNowMany,
  type WeatherLocation,
} from '../hook'

type WeatherChartTab = (typeof CHART_TABS)[number]['key']

// ─────────────────────────────────────────────
// StatTile — 중요도(primary/secondary) 구분
// ─────────────────────────────────────────────

interface StatTileProps {
  label: string
  value: string
  shimmer?: boolean
  /** primary: 체감온도·바람 등 기상 핵심 / secondary: 메타 정보 */
  priority?: 'primary' | 'secondary'
}

function StatTile({ label, value, shimmer = false, priority = 'secondary' }: StatTileProps) {
  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-2.5',
        priority === 'primary' ? 'border-white/12 bg-white/7' : 'border-white/6 bg-white/[0.025]'
      )}
    >
      <p
        className={cn(
          'text-[10px] uppercase tracking-widest',
          priority === 'primary' ? 'text-white/45' : 'text-white/28'
        )}
      >
        {label}
      </p>
      {shimmer ? (
        <div className='mt-1 h-[1.25rem] w-16 animate-pulse rounded bg-white/10' />
      ) : (
        <p
          className={cn(
            'mt-1 truncate text-sm tabular-nums',
            priority === 'primary' ? 'font-semibold text-white/85' : 'font-medium text-white/45'
          )}
        >
          {value}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// PinnedCityTabs — 선택 도시를 더 강하게 강조
// ─────────────────────────────────────────────

type PinnedCityTabsProps = {
  pinnedCities: WeatherLocation[]
  selectedCityId: string
  onSelectCity: (id: string) => void
  nowMap: Record<string, WeatherNow>
}

function PinnedCityTabs({
  pinnedCities,
  selectedCityId,
  onSelectCity,
  nowMap,
}: PinnedCityTabsProps) {
  return (
    <nav
      className='grid border-b border-white/8 px-1.5 py-1.5'
      style={{ gridTemplateColumns: `repeat(${pinnedCities.length}, 1fr)` }}
      aria-label='주요 도시'
    >
      {pinnedCities.map(city => {
        const weather = nowMap[city.id]
        const isSelected = city.id === selectedCityId
        return (
          <button
            key={city.id}
            type='button'
            onClick={() => onSelectCity(city.id)}
            aria-pressed={isSelected}
            className={cn(
              'group flex flex-col items-center gap-0.5 rounded-lg py-2 transition-all duration-200 active:scale-95',
              isSelected ? 'bg-white/14 ring-1 ring-inset ring-white/18' : 'hover:bg-white/6'
            )}
          >
            {/* 도시명 — 선택 여부로 크기·색상 차이 */}
            <span
              className={cn(
                'text-xs font-medium transition-colors',
                isSelected ? 'text-white' : 'text-white/38 group-hover:text-white/65'
              )}
            >
              {city.label}
            </span>
            {/* 기온 미리보기 — 선택된 도시는 더 밝게 */}
            <span
              className={cn(
                'tabular-nums text-[10px] transition-colors',
                isSelected
                  ? 'font-semibold text-white/70'
                  : 'text-white/22 group-hover:text-white/40'
              )}
            >
              {weather != null ? `${weather.tempC}°` : '···'}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ─────────────────────────────────────────────
// MainWeatherPanel — 1차/2차 정보 계층 명확화
// ─────────────────────────────────────────────

type MainWeatherPanelProps = {
  selectedCity: WeatherLocation
  now: Date | null
  mainNow: WeatherNow | null
  isLoading: boolean
}

function MainWeatherPanel({ selectedCity, now, mainNow, isLoading }: MainWeatherPanelProps) {
  const tempC = mainNow?.tempC

  const gradientClass =
    tempC != null && tempC >= 28
      ? 'from-orange-400'
      : tempC != null && tempC <= 0
        ? 'from-blue-400'
        : 'from-white'

  return (
    <div className='border-b border-white/8'>
      <div className='relative overflow-hidden px-5 py-6'>
        <div
          className={cn(
            'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-[0.04] transition-all duration-700',
            gradientClass
          )}
        />

        {/* ── 1차 정보: 위치 + 현지시각 ── */}
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            {/* 위치 좌표 — 보조 정보: 작고 흐리게 */}
            <div className='flex items-center gap-1 text-[10px] text-white/25'>
              <MapPin className='h-3 w-3 shrink-0' />
              <span className='truncate'>{formatCoord(selectedCity.coords)}</span>
            </div>
            {/* 도시명 — 핵심 레이블 */}
            <h2 className='mt-0.5 truncate text-2xl font-bold tracking-tight text-white/90'>
              {selectedCity.label}
            </h2>
            {/* 국가명 — 보조: 흐리게 */}
            <p className='mt-0.5 text-xs text-white/35'>{selectedCity.country}</p>
          </div>

          {/* 현지 시각 — 보조 정보: 우측 정렬, 차분하게 */}
          <div className='shrink-0 text-right'>
            <p className='text-[9px] uppercase tracking-widest text-white/25'>현지 시각</p>
            <p className='mt-0.5 text-lg font-light tabular-nums text-white/55'>
              {now ? formatLocalTime(now, selectedCity.timezone) : '--:--'}
            </p>
          </div>
        </div>

        {/* ── 2차 정보: 기온 (가장 중요한 단일 숫자) ── */}
        <div className='mt-6 flex items-end gap-4'>
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
              {/* 기온 숫자 — 페이지 내 가장 큰 시각적 요소 */}
              <div className='flex items-start gap-1'>
                <p
                  className={cn(
                    'text-8xl font-thin tabular-nums leading-none transition-colors duration-500',
                    tempColorClass(mainNow?.tempC)
                  )}
                >
                  {mainNow?.tempC != null ? `${mainNow.tempC}` : '--'}
                </p>
                <span
                  className={cn(
                    'mt-2 text-3xl font-thin transition-colors duration-500',
                    tempColorClass(mainNow?.tempC)
                  )}
                >
                  °
                </span>
              </div>

              {/* 날씨 상태 — 2차 정보: 기온보다 작게 */}
              <div className='min-w-0 pb-2'>
                <div className='flex items-center gap-1.5'>
                  {(() => {
                    const { Icon, colorClass } = weatherMeta(mainNow?.label)
                    return <Icon className={cn('h-4 w-4 shrink-0', colorClass)} />
                  })()}
                  <p className='text-base font-semibold text-white/75'>
                    {mainNow?.label ?? '정보 없음'}
                  </p>
                </div>
                {/* 코멘트 — 3차 정보: 가장 흐리게 */}
                {weatherComment(mainNow?.tempC, mainNow?.label) && (
                  <p className='mt-1.5 text-[11px] leading-relaxed text-white/38'>
                    {weatherComment(mainNow?.tempC, mainNow?.label)}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── 3차 정보: StatTile — 기상(primary) vs 메타(secondary) 구분 ── */}
        <div className='mt-5 grid grid-cols-2 gap-1.5 sm:grid-cols-4'>
          {/* 체감온도·바람: 기상 판단에 직접 필요 → primary */}
          <StatTile
            label='체감온도'
            value={mainNow?.feelsLikeC != null ? `${mainNow.feelsLikeC}°C` : '-'}
            shimmer={isLoading}
            priority='primary'
          />
          <StatTile
            label='바람'
            value={mainNow?.windMs != null ? `${mainNow.windMs} m/s` : '-'}
            shimmer={isLoading}
            priority='primary'
          />
          {/* 시간대·갱신: 참고용 메타 정보 → secondary */}
          <StatTile
            label='시간대'
            value={selectedCity.timezone.split('/')[1]?.replace('_', ' ') ?? selectedCity.timezone}
            priority='secondary'
          />
          <StatTile
            label='갱신'
            value={mainNow ? formatTimeLabel(mainNow.fetchedAt, selectedCity.timezone) : '-'}
            shimmer={isLoading}
            priority='secondary'
          />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Chart dot — 첫/마지막/피크만 레이블
// ─────────────────────────────────────────────

interface CustomDotProps {
  cx?: number
  cy?: number
  value?: number | [number, number]
  index?: number
  color: string
  unit: string
  total: number
  peakIndex: number
}

function CustomDotWithLabel({
  cx = 0,
  cy = 0,
  value,
  index = 0,
  color,
  unit,
  total,
  peakIndex,
}: CustomDotProps) {
  if (value == null) return null
  const displayValue = Array.isArray(value) ? value[1] : value
  if (displayValue == null) return null

  const isFirst = index === 0
  const isLast = index === total - 1
  const isPeak = index === peakIndex
  const showLabel = isFirst || isLast || isPeak
  const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle'

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={showLabel ? 3.5 : 2}
        fill={color}
        fillOpacity={showLabel ? 1 : 0.35}
      />
      {showLabel && (
        <text
          x={cx}
          y={cy - 8}
          textAnchor={anchor}
          fill='rgba(255,255,255,0.85)'
          fontSize={10}
          fontWeight={600}
        >
          {displayValue}
          {unit}
        </text>
      )}
    </g>
  )
}

// ─────────────────────────────────────────────
// HourlyForecastPanel — 섹션 컨텍스트 추가
// ─────────────────────────────────────────────

type HourlyForecastPanelProps = {
  isLoading: boolean
  mainHourlyLoading: boolean
  hourlyItems: WeatherHourlyPoint[]
  timezone: string
  chartTab: WeatherChartTab
  onChangeChartTab: (tab: WeatherChartTab) => void
}

function HourlyForecastPanel({
  isLoading,
  mainHourlyLoading,
  hourlyItems,
  timezone,
  chartTab,
  onChangeChartTab,
}: HourlyForecastPanelProps) {
  const chartData = hourlyItems.map(point => ({
    time: formatChartTime(point.time, timezone),
    temp: point.temperature,
    precip: point.precipitationProbability ?? 0,
    wind: point.windSpeed ?? 0,
  }))

  const peakIndex = useMemo(() => {
    const key = chartTab as 'temp' | 'precip' | 'wind'
    let maxVal = -Infinity
    let maxIdx = 0
    chartData.forEach((d, i) => {
      if (d[key] > maxVal) {
        maxVal = d[key]
        maxIdx = i
      }
    })
    return maxIdx
  }, [chartData, chartTab])

  const showSkeleton = isLoading || mainHourlyLoading || hourlyItems.length === 0

  return (
    <div className='px-5 pb-5 pt-4'>
      {/* 섹션 헤더 — 이게 "시간별 예보"임을 명확히 */}
      <div className='mb-3 flex items-center justify-between'>
        <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30'>
          시간별 예보
        </p>
        {/* 차트 탭 — 우측 정렬로 주/보조 구분 */}
        <div className='flex items-center gap-1'>
          {CHART_TABS.map(tab => {
            const isActive = chartTab === tab.key
            return (
              <button
                key={tab.key}
                type='button'
                onClick={() => onChangeChartTab(tab.key)}
                className={cn(
                  'flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all duration-150 active:scale-95',
                  isActive
                    ? 'bg-white/10 text-white/90'
                    : 'text-white/30 hover:bg-white/5 hover:text-white/60'
                )}
              >
                <span
                  className='h-1.5 w-1.5 rounded-full'
                  style={{ background: tab.color, opacity: isActive ? 1 : 0.35 }}
                />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {showSkeleton ? (
        <div className='flex h-[160px] animate-pulse items-end gap-1 rounded-xl bg-white/4 px-4 pb-4 pt-6'>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className='flex-1 rounded-sm bg-white/8'
              style={{ height: `${30 + Math.sin(i * 0.8) * 20 + 20}%` }}
            />
          ))}
        </div>
      ) : (
        <ResponsiveContainer width='100%' height={160}>
          <AreaChart data={chartData} margin={{ top: 24, right: 16, left: 16, bottom: 0 }}>
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

            <XAxis
              dataKey='time'
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
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
                    peakIndex={peakIndex}
                  />
                )}
              />
            )}
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
                    peakIndex={peakIndex}
                  />
                )}
              />
            )}
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
                    unit='m/s'
                    total={hourlyItems.length}
                    peakIndex={peakIndex}
                  />
                )}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// OtherCitiesPanel — 도시명/기온 계층 강화
// ─────────────────────────────────────────────

type OtherCitiesPanelProps = {
  subCities: WeatherLocation[]
  subNowMap: Record<string, WeatherNow>
  subLoading: boolean
  now: Date | null
  onSelectCity: (id: string) => void
}

function OtherCitiesPanel({
  subCities,
  subNowMap,
  subLoading,
  now,
  onSelectCity,
}: OtherCitiesPanelProps) {
  return (
    <section className='w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-md'>
      <div className='border-b border-white/8 px-5 py-3'>
        <p className='text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30'>
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
              onClick={() => onSelectCity(city.id)}
              className={cn(
                'group min-w-0 px-5 py-4 text-left transition-all duration-150 active:scale-[0.98]',
                'hover:bg-white/5 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-1 focus-visible:ring-white/20',
                'sm:odd:border-r sm:odd:border-white/8',
                'lg:odd:border-r-0',
                'lg:[&:nth-child(3n+2)]:border-l lg:[&:nth-child(3n+2)]:border-r lg:[&:nth-child(3n+2)]:border-white/8',
                'lg:[&:nth-child(3n)]:border-l lg:[&:nth-child(3n)]:border-white/8'
              )}
            >
              {/* 1행: 도시명(주) + 아이콘(보조) */}
              <div className='flex items-center justify-between gap-2'>
                <p className='min-w-0 truncate text-sm font-semibold text-white/80 transition-colors group-hover:text-white/95'>
                  {city.label}
                </p>
                {!cityLoading && (
                  <WeatherIcon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                      weatherColor
                    )}
                  />
                )}
              </div>

              {/* 2행: 기온(주) + 날씨 상태(보조) — 기온이 압도적으로 크게 */}
              <div className='mt-2 flex items-end justify-between gap-2'>
                {cityLoading ? (
                  <div className='h-8 w-14 animate-pulse rounded-md bg-white/8' />
                ) : (
                  <p
                    className={cn(
                      'text-3xl font-light tabular-nums leading-none transition-colors duration-300',
                      tempColorClass(weather?.tempC)
                    )}
                  >
                    {weather != null ? `${weather.tempC}°` : '--°'}
                  </p>
                )}
                <p
                  className={cn(
                    'min-w-0 truncate text-xs font-medium',
                    cityLoading ? 'text-transparent' : weatherColor
                  )}
                >
                  {weather?.label ?? '—'}
                </p>
              </div>

              {/* 3행: 보조 정보(체감·바람) — 가장 흐리게 */}
              <div className='mt-2.5 flex items-center gap-3 text-[10px] text-white/25'>
                <span className='inline-flex items-center gap-1'>
                  <Thermometer className='h-3 w-3 shrink-0' />
                  체감 {weather?.feelsLikeC != null ? `${weather.feelsLikeC}°` : '-'}
                </span>
                <span className='inline-flex items-center gap-1'>
                  <Navigation className='h-3 w-3 shrink-0' />
                  {weather?.windMs != null ? `${weather.windMs} m/s` : '-'}
                </span>
                {/* 현지 시각 — 기존보다 더 아래 계층 */}
                <span className='ml-auto tabular-nums'>
                  {now ? formatLocalTime(now, city.timezone) : '--:--'}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function WeatherPage() {
  const [selectedCityId, setSelectedCityId] = useState<string>(WEATHER_CITIES[0]?.id ?? 'seoul')
  const [visible, setVisible] = useState(true)
  const [chartTab, setChartTab] = useState<WeatherChartTab>('temp')
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSelectCity = (id: string) => {
    if (id === selectedCityId) return
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setVisible(false)
    fadeTimerRef.current = setTimeout(() => {
      fadeTimerRef.current = null
      setSelectedCityId(id)
    }, 150)
  }

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

  useEffect(() => {
    if (!mainNowLoading && mainNow) {
      const t = setTimeout(() => setVisible(true), 30)
      return () => clearTimeout(t)
    }
  }, [mainNowLoading, mainNow])

  const hourlyItems = useMemo(() => mainHourly?.points.slice(0, 12) ?? [], [mainHourly?.points])
  const isLoading = mainNowLoading || !mainNow

  const pinnedCities = useMemo(
    () => WEATHER_CITIES.filter(c => (PINNED_CITY_IDS as readonly string[]).includes(c.id)),
    []
  )

  const allNowMap = useMemo<Record<string, WeatherNow>>(() => {
    const map: Record<string, WeatherNow> = { ...subNowMap }
    if (mainNow && selectedCity) map[selectedCity.id] = mainNow
    return map
  }, [subNowMap, mainNow, selectedCity])

  if (!selectedCity) return null

  return (
    <div className='flex w-full min-w-0 flex-col gap-4'>
      <section className='overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_16px_48px_rgba(0,0,0,0.28)] backdrop-blur-md'>
        <PinnedCityTabs
          pinnedCities={pinnedCities}
          selectedCityId={selectedCityId}
          onSelectCity={handleSelectCity}
          nowMap={allNowMap}
        />
        <div
          className={cn(
            'flex flex-col transition-all duration-300 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
          )}
        >
          <MainWeatherPanel
            selectedCity={selectedCity}
            now={now}
            mainNow={mainNow}
            isLoading={isLoading}
          />
          <HourlyForecastPanel
            isLoading={isLoading}
            mainHourlyLoading={mainHourlyLoading}
            hourlyItems={hourlyItems}
            timezone={selectedCity.timezone}
            chartTab={chartTab}
            onChangeChartTab={setChartTab}
          />
        </div>
      </section>

      <OtherCitiesPanel
        subCities={subCities}
        subNowMap={subNowMap}
        subLoading={subLoading}
        now={now}
        onSelectCity={handleSelectCity}
      />
    </div>
  )
}
