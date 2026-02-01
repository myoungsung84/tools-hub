'use client'

import { Wind } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import type { WeatherNow } from '@/features/time/types/weather-now.types'

type Props = { weather: WeatherNow | null }

export function WeatherTalk({ weather }: Props) {
  // 배경 대비를 위해 bg-neutral-900/50 정도로 약간 더 밝게 조정 가능
  const cardClass =
    'relative h-[150px] w-full p-5 flex flex-col select-none z-10 overflow-hidden text-left bg-white/[0.02]'

  if (!weather) {
    return (
      <div className={cardClass}>
        <div className='space-y-3'>
          <Skeleton className='h-4 w-16 bg-white/10' />
          <Skeleton className='h-8 w-24 bg-white/10' />
        </div>
      </div>
    )
  }

  const { tempC: temp, windMs: windRaw, label, locationLabel: location } = weather
  const wind = windRaw ?? 0

  const getStatusText = () => {
    let line1 = '평온한 하늘 아래 기분 좋은 하루 ✨'
    if (label.includes('뇌우')) line1 = '하늘이 번쩍! 실내에서 안전하게 ⚡'
    else if (label.includes('소나기')) line1 = '갑작스러운 비, 잠시 쉬어가세요 🌦️'
    else if (label.includes('비')) line1 = '부드러운 빗소리에 마음이 차분해져요 ☔'
    else if (label.includes('눈')) line1 = '포근한 눈과 함께 낭만 가득한 시간 ☃️'
    else if (label.includes('안개')) line1 = '뿌연 시야, 차분히 앞을 살펴주세요 🌫️'
    else if (label.includes('맑음')) line1 = '눈부신 햇살이 반겨주는 맑은 날 ☀️'
    else if (label.includes('흐림')) line1 = '차분한 구름이 내려앉은 하늘 ☁️'

    let line2 = '적당한 기온으로 활동하기 좋습니다.'
    if (temp > 32) line2 = '숨 막히는 폭염, 시원한 물 한 잔 필수 🥤'
    else if (temp > 28) line2 = '조금 덥네요, 반팔 차림을 추천해요 👕'
    else if (temp < -5) line2 = '살을 파고드는 한파, 꽁꽁 싸매세요 🧣'
    else if (temp < 10) line2 = '쌀쌀한 공기, 도톰한 겉옷을 챙기세요 🧥'
    else if (wind > 7) line2 = '강풍 주의! 소지품 관리에 유의하세요 🪁'

    return { line1, line2 }
  }

  const { line1, line2 } = getStatusText()

  return (
    <div className={cardClass}>
      <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/4 to-transparent opacity-80 group-hover:opacity-100 transition-all duration-700' />

      <div className='relative flex flex-col gap-2.5'>
        <div className='flex items-center gap-2'>
          <span className='text-[13px] font-black tracking-tight text-white uppercase opacity-100'>
            {location}
          </span>
          <div className='w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)]' />
        </div>

        <div className='flex flex-col gap-1 min-h-[36px]'>
          <p className='text-[11px] font-bold text-white leading-tight break-keep drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]'>
            {line1}
          </p>
          <p className='text-[10px] font-semibold text-blue-100/60 group-hover:text-blue-100/90 transition-colors leading-tight break-keep'>
            {line2}
          </p>
        </div>
      </div>

      {/* 하단 부분 */}
      <div className='relative mt-auto flex items-end justify-between'>
        <div className='flex flex-col gap-0.5'>
          <div className='flex items-baseline gap-1.5'>
            <span className='text-4xl font-light tabular-nums tracking-tighter text-white drop-shadow-md'>
              {temp}°
            </span>
            {weather.feelsLikeC != null && (
              <span className='text-[11px] text-white/40 font-bold tracking-tighter mb-1'>
                /{weather.feelsLikeC}°
              </span>
            )}
          </div>
          <div className='text-[9px] font-black text-white/30 uppercase tracking-[0.2em]'>
            {label}
          </div>
        </div>

        <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 group-hover:border-blue-400/50 transition-all backdrop-blur-sm'>
          <Wind
            className={`w-3 h-3 ${wind > 5 ? 'text-blue-300 animate-pulse' : 'text-white/60'}`}
          />
          <span className='text-[10px] tabular-nums font-black text-white/80'>{wind}m/s</span>
        </div>
      </div>

      <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
    </div>
  )
}
