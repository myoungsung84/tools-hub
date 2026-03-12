import type { LucideIcon } from 'lucide-react'
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun } from 'lucide-react'

import type { Coords } from '@/features/weather/types'

export function formatLocalTime(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)
}

export function formatTimeLabel(time: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(time)
}

export function formatChartTime(time: Date, timeZone: string): string {
  const hour = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hour12: false }).format(time),
    10
  )
  const ampm = hour < 12 ? 'AM' : 'PM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${ampm} ${h}시`
}

export function formatCoord(coords: Coords): string {
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

export function tempColorClass(tempC: number | null | undefined): string {
  if (tempC == null) return 'text-white/90'
  if (tempC >= 35) return 'text-red-400'
  if (tempC >= 28) return 'text-orange-400'
  if (tempC >= 20) return 'text-yellow-300'
  if (tempC >= 10) return 'text-emerald-400'
  if (tempC >= 0) return 'text-sky-300'
  return 'text-blue-400'
}

export function weatherMeta(label: string | null | undefined): {
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

export function weatherComment(
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
