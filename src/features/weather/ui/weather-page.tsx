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

type PinnedCityTabsProps = {
  pinnedCities: WeatherLocation[]
  selectedCityId: string
  onSelectCity: (id: string) => void
}

function PinnedCityTabs({ pinnedCities, selectedCityId, onSelectCity }: PinnedCityTabsProps) {
  return (
    <nav
      className='grid border-b border-white/8 px-1 py-1.5'
      style={{ gridTemplateColumns: `repeat(${pinnedCities.length}, 1fr)` }}
      aria-label='주요 도시'
    >
      {pinnedCities.map(city => (
        <button
          key={city.id}
          type='button'
          onClick={() => onSelectCity(city.id)}
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
  )
}

type MainWeatherPanelProps = {
  selectedCity: WeatherLocation
  now: Date | null
  mainNow: WeatherNow | null
  isLoading: boolean
}

function MainWeatherPanel({ selectedCity, now, mainNow, isLoading }: MainWeatherPanelProps) {
  return (
    <div className='border-b border-white/8'>
      <div className='relative overflow-hidden px-5 py-6'>
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
                <span className={cn('mt-1 text-3xl font-thin', tempColorClass(mainNow?.tempC))}>
                  °
                </span>
              </div>

              <div className='min-w-0 pb-1'>
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
            value={selectedCity.timezone.split('/')[1]?.replace('_', ' ') ?? selectedCity.timezone}
          />
          <StatTile
            label='갱신'
            value={mainNow ? formatTimeLabel(mainNow.fetchedAt, selectedCity.timezone) : '-'}
            shimmer={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

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

  return (
    <div className='px-5 pb-5 pt-4'>
      <div className='mb-4 flex items-center gap-5 border-b border-white/8 pb-3'>
        {CHART_TABS.map(tab => (
          <button
            key={tab.key}
            type='button'
            onClick={() => onChangeChartTab(tab.key)}
            className='group flex flex-col items-start gap-1.5'
          >
            <span
              className={cn(
                'text-xs font-medium transition-colors',
                chartTab === tab.key ? 'text-white/90' : 'text-white/35 group-hover:text-white/60'
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
          <AreaChart data={chartData} margin={{ top: 28, right: 16, left: 16, bottom: 0 }}>
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
  )
}

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
              onClick={() => onSelectCity(city.id)}
              className={cn(
                'group min-w-0 px-5 py-4 text-left transition-colors duration-150',
                'hover:bg-white/4 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-1 focus-visible:ring-white/20',
                'sm:odd:border-r sm:odd:border-white/8',
                'lg:odd:border-r-0',
                'lg:[&:nth-child(3n+2)]:border-l lg:[&:nth-child(3n+2)]:border-r lg:[&:nth-child(3n+2)]:border-white/8',
                'lg:[&:nth-child(3n)]:border-l lg:[&:nth-child(3n)]:border-white/8'
              )}
            >
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

              {!cityLoading && weatherComment(weather?.tempC, weather?.label) && (
                <p className='mt-1.5 line-clamp-1 text-[10px] text-white/40'>
                  {weatherComment(weather?.tempC, weather?.label)}
                </p>
              )}

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
  )
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
  const [chartTab, setChartTab] = useState<WeatherChartTab>('temp')
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
      <section className='overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_16px_48px_rgba(0,0,0,0.28)] backdrop-blur-md'>
        <PinnedCityTabs
          pinnedCities={pinnedCities}
          selectedCityId={selectedCityId}
          onSelectCity={handleSelectCity}
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
