export type WorldTimeItem = {
  label: string
  timeZone: string
  time: string
  gmtOffsetLabel: string
  dateLabel: string
}

type WorldCity = {
  label: string
  timeZone: string
}

export const WORLD_CITIES: readonly WorldCity[] = [
  { label: '뉴욕', timeZone: 'America/New_York' },
  { label: '토론토', timeZone: 'America/Toronto' },
  { label: '런던', timeZone: 'Europe/London' },
  { label: '파리', timeZone: 'Europe/Paris' },
  { label: '두바이', timeZone: 'Asia/Dubai' },
  { label: '뭄바이', timeZone: 'Asia/Kolkata' },
  { label: '도쿄', timeZone: 'Asia/Tokyo' },
  { label: '싱가포르', timeZone: 'Asia/Singapore' },
  { label: '상하이', timeZone: 'Asia/Shanghai' },
  { label: '시드니', timeZone: 'Australia/Sydney' },
] as const

function extractDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date)

  const month = Number(parts.find(part => part.type === 'month')?.value ?? 1)
  const day = Number(parts.find(part => part.type === 'day')?.value ?? 1)
  const weekday = parts.find(part => part.type === 'weekday')?.value ?? ''

  return { month, day, weekday }
}

function formatCityDate(date: Date, timeZone: string) {
  const { month, day, weekday } = extractDateParts(date, timeZone)
  return `${month}월 ${day}일 (${weekday})`
}

function formatCityTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function formatGmtOffset(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
  }).formatToParts(date)

  return parts.find(part => part.type === 'timeZoneName')?.value ?? 'GMT'
}

export function buildWorldTimes(now: Date): WorldTimeItem[] {
  return WORLD_CITIES.map(city => ({
    label: city.label,
    timeZone: city.timeZone,
    time: formatCityTime(now, city.timeZone),
    gmtOffsetLabel: formatGmtOffset(now, city.timeZone),
    dateLabel: formatCityDate(now, city.timeZone),
  }))
}
