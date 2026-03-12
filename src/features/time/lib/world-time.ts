export type WorldTimeItem = {
  label: string
  timeZone: string
  time: string
  hour: number
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

// Module-scope formatter caches keyed by timeZone
const datePartFormatterCache = new Map<string, Intl.DateTimeFormat>()
const timeFormatterCache = new Map<string, Intl.DateTimeFormat>()
const gmtOffsetFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getDatePartFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = datePartFormatterCache.get(timeZone)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('ko-KR', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    })
    datePartFormatterCache.set(timeZone, fmt)
  }
  return fmt
}

function getTimeFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = timeFormatterCache.get(timeZone)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('ko-KR', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    timeFormatterCache.set(timeZone, fmt)
  }
  return fmt
}

function getGmtOffsetFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = gmtOffsetFormatterCache.get(timeZone)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    })
    gmtOffsetFormatterCache.set(timeZone, fmt)
  }
  return fmt
}

function extractDateParts(date: Date, timeZone: string) {
  const parts = getDatePartFormatter(timeZone).formatToParts(date)

  const month = Number(parts.find(part => part.type === 'month')?.value ?? 1)
  const day = Number(parts.find(part => part.type === 'day')?.value ?? 1)
  const weekday = parts.find(part => part.type === 'weekday')?.value ?? ''

  return { month, day, weekday }
}

function formatCityDate(date: Date, timeZone: string) {
  const { month, day, weekday } = extractDateParts(date, timeZone)
  return `${month}월 ${day}일 (${weekday})`
}

function formatCityTimeAndHour(date: Date, timeZone: string): { time: string; hour: number } {
  const parts = getTimeFormatter(timeZone).formatToParts(date)
  const hourStr = parts.find(p => p.type === 'hour')?.value ?? '0'
  const minuteStr = parts.find(p => p.type === 'minute')?.value ?? '00'
  return {
    time: `${hourStr}:${minuteStr}`,
    hour: parseInt(hourStr, 10),
  }
}

function formatGmtOffset(date: Date, timeZone: string) {
  const parts = getGmtOffsetFormatter(timeZone).formatToParts(date)
  return parts.find(part => part.type === 'timeZoneName')?.value ?? 'GMT'
}

export function buildWorldTimes(now: Date): WorldTimeItem[] {
  return WORLD_CITIES.map(city => {
    const { time, hour } = formatCityTimeAndHour(now, city.timeZone)
    return {
      label: city.label,
      timeZone: city.timeZone,
      time,
      hour,
      gmtOffsetLabel: formatGmtOffset(now, city.timeZone),
      dateLabel: formatCityDate(now, city.timeZone),
    }
  })
}
