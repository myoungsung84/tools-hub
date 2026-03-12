'use client'

import { CloudSun, Droplets, Loader2, Navigation, Thermometer, Wind } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useSyncedNow } from '@/features/time/hook/use-synced-now'
import type { Coords } from '@/features/weather/types'

import {
  useWeatherHourlyByLocation,
  useWeatherNowByLocation,
  useWeatherNowMany,
  type WeatherLocation,
} from '../hook'

const WEATHER_CITIES: WeatherLocation[] = [
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
    id: 'singapore',
    label: '싱가포르',
    country: '싱가포르',
    timezone: 'Asia/Singapore',
    coords: { latitude: 1.3521, longitude: 103.8198 },
  },
  {
    id: 'london',
    label: '런던',
    country: '영국',
    timezone: 'Europe/London',
    coords: { latitude: 51.5074, longitude: -0.1278 },
  },
  {
    id: 'new-york',
    label: '뉴욕',
    country: '미국',
    timezone: 'America/New_York',
    coords: { latitude: 40.7128, longitude: -74.006 },
  },
]

function formatLocalTime(now: Date, timeZone: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
}

function formatTimeLabel(time: Date, timeZone: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(time)
}

function formatCoord(coords: Coords) {
  return `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`
}

export default function WeatherPage() {
  const [selectedCityId, setSelectedCityId] = useState(WEATHER_CITIES[0]?.id ?? 'seoul')

  const selectedCity = useMemo(
    () => WEATHER_CITIES.find(city => city.id === selectedCityId) ?? WEATHER_CITIES[0],
    [selectedCityId]
  )
  const now = useSyncedNow()
  const subCities = useMemo(
    () => WEATHER_CITIES.filter(city => city.id !== selectedCity?.id),
    [selectedCity]
  )

  const { data: mainNow, loading: mainNowLoading } = useWeatherNowByLocation(selectedCity)
  const { data: mainHourly, loading: mainHourlyLoading } = useWeatherHourlyByLocation(selectedCity, 24)
  const { data: subNowMap, loading: subLoading } = useWeatherNowMany(subCities)

  const hourlyItems = useMemo(() => mainHourly?.points.slice(0, 12) ?? [], [mainHourly?.points])

  if (!selectedCity) {
    return null
  }

  return (
    <div className='relative w-full flex flex-1 flex-col gap-8'>
      <section className='rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-md'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.28em] text-white/45'>Weather</p>
            <h1 className='mt-2 text-2xl font-bold text-white/95'>지역별 실시간 날씨</h1>
            <p className='mt-1 text-sm text-white/60'>
              메인 도시 기준 시간별 예보와 주요 도시 현재 날씨를 함께 확인합니다.
            </p>
          </div>
          <div className='rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-right'>
            <p className='text-[11px] text-white/45'>{selectedCity.country}</p>
            <p className='text-sm font-semibold text-white/90'>{selectedCity.label}</p>
            <p className='text-xs tabular-nums text-white/60'>{formatCoord(selectedCity.coords)}</p>
          </div>
        </div>

        <div className='mt-6 grid gap-4 lg:grid-cols-[1.25fr_1fr]'>
          <article className='rounded-2xl border border-white/10 bg-black/20 p-5'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-xs uppercase tracking-[0.2em] text-white/40'>Main City</p>
                <h2 className='mt-1 text-xl font-semibold text-white/95'>{selectedCity.label}</h2>
              </div>
              <CloudSun className='h-6 w-6 text-white/65' />
            </div>

            <div className='mt-5 flex flex-wrap items-end gap-3'>
              <p className='text-5xl font-light tabular-nums text-white/95'>
                {mainNowLoading ? '--' : `${mainNow?.tempC ?? '--'}°`}
              </p>
              <div className='pb-1'>
                <p className='text-sm font-medium text-white/80'>
                  {mainNowLoading ? '불러오는 중' : (mainNow?.label ?? '정보 없음')}
                </p>
                <p className='text-xs text-white/55'>
                  현재 시각 {now ? formatLocalTime(now, selectedCity.timezone) : '--:--'}
                </p>
              </div>
            </div>

            <div className='mt-5 grid grid-cols-2 gap-2 text-xs text-white/75 sm:grid-cols-4'>
              <div className='rounded-xl border border-white/10 bg-white/5 px-3 py-2'>
                <p className='text-white/45'>체감</p>
                <p className='mt-1 font-semibold tabular-nums'>
                  {mainNow?.feelsLikeC != null ? `${mainNow.feelsLikeC}°` : '-'}
                </p>
              </div>
              <div className='rounded-xl border border-white/10 bg-white/5 px-3 py-2'>
                <p className='text-white/45'>풍속</p>
                <p className='mt-1 font-semibold tabular-nums'>
                  {mainNow?.windMs != null ? `${mainNow.windMs}m/s` : '-'}
                </p>
              </div>
              <div className='rounded-xl border border-white/10 bg-white/5 px-3 py-2'>
                <p className='text-white/45'>타임존</p>
                <p className='mt-1 font-semibold'>{selectedCity.timezone}</p>
              </div>
              <div className='rounded-xl border border-white/10 bg-white/5 px-3 py-2'>
                <p className='text-white/45'>업데이트</p>
                <p className='mt-1 font-semibold'>
                  {mainNow ? formatTimeLabel(mainNow.fetchedAt, selectedCity.timezone) : '-'}
                </p>
              </div>
            </div>
          </article>

          <article className='rounded-2xl border border-white/10 bg-black/20 p-5'>
            <div className='mb-3 flex items-center justify-between'>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/45'>
                Hourly Forecast
              </p>
              {mainHourlyLoading && <Loader2 className='h-4 w-4 animate-spin text-white/45' />}
            </div>

            <div className='flex gap-2 overflow-x-auto pb-1'>
              {hourlyItems.length === 0 &&
                Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className='w-[110px] shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2'
                  >
                    <p className='text-xs text-white/40'>--:--</p>
                    <p className='mt-1 text-lg text-white/65'>--°</p>
                    <p className='text-[11px] text-white/40'>로딩 중</p>
                  </div>
                ))}

              {hourlyItems.map(point => (
                <div
                  key={point.time.toISOString()}
                  className='w-[124px] shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2'
                >
                  <p className='text-xs text-white/45'>
                    {formatTimeLabel(point.time, selectedCity.timezone)}
                  </p>
                  <p className='mt-1 text-lg font-semibold tabular-nums text-white/90'>
                    {point.temperature}°
                  </p>
                  <p className='text-[11px] text-white/55'>{point.condition}</p>
                  <div className='mt-2 space-y-1 text-[10px] text-white/45'>
                    <p className='flex items-center gap-1'>
                      <Droplets className='h-3 w-3' />
                      {point.precipitationProbability ?? '-'}%
                    </p>
                    <p className='flex items-center gap-1'>
                      <Wind className='h-3 w-3' />
                      {point.windSpeed != null ? `${point.windSpeed}m/s` : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.2)] backdrop-blur-md'>
        <div className='mb-3 flex items-center justify-between'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/45'>Sub Cities</p>
          {subLoading && <Loader2 className='h-4 w-4 animate-spin text-white/45' />}
        </div>
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
          {subCities.map(city => {
            const weather = subNowMap[city.id]
            return (
              <button
                key={city.id}
                type='button'
                onClick={() => setSelectedCityId(city.id)}
                className='rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left transition hover:border-white/25 hover:bg-black/30'
              >
                <div className='flex items-center justify-between gap-2'>
                  <p className='text-sm font-semibold text-white/90'>{city.label}</p>
                  <p className='text-[10px] text-white/45'>{city.country}</p>
                </div>
                <p className='mt-1 text-[11px] text-white/50'>
                  {weather ? formatTimeLabel(weather.fetchedAt, city.timezone) : '--:--'}
                </p>
                <div className='mt-2 flex items-center justify-between'>
                  <p className='text-xl font-semibold tabular-nums text-white/90'>
                    {weather ? `${weather.tempC}°` : '--°'}
                  </p>
                  <p className='text-[11px] text-white/55'>{weather?.label ?? '로딩 중'}</p>
                </div>
                <div className='mt-2 flex items-center gap-3 text-[10px] text-white/45'>
                  <span className='inline-flex items-center gap-1'>
                    <Thermometer className='h-3 w-3' />
                    체감 {weather?.feelsLikeC != null ? `${weather.feelsLikeC}°` : '-'}
                  </span>
                  <span className='inline-flex items-center gap-1'>
                    <Navigation className='h-3 w-3' />
                    {weather?.windMs != null ? `${weather.windMs}m/s` : '-'}
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
