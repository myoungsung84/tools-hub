export type NormalizedUserAgent = {
  raw: string
  browser: 'Chrome' | 'Edge' | 'Safari' | 'Unknown'
  os: 'Windows' | 'macOS' | 'Android' | 'iOS' | 'Unknown'
  isMobile: boolean
}

function header(headers: Headers, key: string): string | null {
  const v = headers.get(key)
  return v?.trim() || null
}

function normalizeLoopback(ip: string) {
  return ip === '::1' ? '127.0.0.1' : ip
}

function isValidIpv4(ip: string) {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  for (const p of parts) {
    if (p.length === 0 || p.length > 3) return false
    if (!/^\d+$/.test(p)) return false
    const n = Number(p)
    if (n < 0 || n > 255) return false
  }
  return true
}

function isValidIpv6(ip: string) {
  const s = ip.split('%')[0]
  if (s.length < 2) return false
  if (!/^[0-9a-fA-F:]+$/.test(s)) return false
  return s.includes(':')
}

function isValidIp(ip: string) {
  const s = ip.trim()
  if (!s) return false
  if (s === 'unknown') return false
  return isValidIpv4(s) || isValidIpv6(s)
}

function pickFromXForwardedFor(xff: string | null) {
  if (!xff) return null
  const candidates = xff
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  for (const c of candidates) {
    const ip = c.replace(/^\[|\]$/g, '')
    if (isValidIp(ip)) return ip
  }
  return null
}

export function pickClientIp(headers: Headers): string {
  const cf = header(headers, 'cf-connecting-ip')
  if (cf && isValidIp(cf)) return normalizeLoopback(cf)

  const tci = header(headers, 'true-client-ip')
  if (tci && isValidIp(tci)) return normalizeLoopback(tci)

  const xri = header(headers, 'x-real-ip')
  if (xri && isValidIp(xri)) return normalizeLoopback(xri)

  const xffPicked = pickFromXForwardedFor(header(headers, 'x-forwarded-for'))
  if (xffPicked) return normalizeLoopback(xffPicked)

  return 'unknown'
}

export function readUserAgent(headers: Headers): string {
  return header(headers, 'user-agent') ?? 'unknown'
}

export function normalizeUserAgent(uaRaw: string | null | undefined): NormalizedUserAgent {
  const raw = uaRaw?.trim() || 'unknown'
  const l = raw.toLowerCase()

  const isMobile =
    l.includes('mobile') || l.includes('android') || l.includes('iphone') || l.includes('ipad')

  const browser: NormalizedUserAgent['browser'] = l.includes('edg/')
    ? 'Edge'
    : l.includes('chrome/')
      ? 'Chrome'
      : l.includes('safari/')
        ? 'Safari'
        : 'Unknown'

  const os: NormalizedUserAgent['os'] = l.includes('windows')
    ? 'Windows'
    : l.includes('mac os x')
      ? 'macOS'
      : l.includes('android')
        ? 'Android'
        : l.includes('iphone') || l.includes('ipad')
          ? 'iOS'
          : 'Unknown'

  return { raw, browser, os, isMobile }
}

export function isPrivateIp(ip: string): boolean {
  if (!ip) return false
  if (ip === '::1') return true

  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) {
    return true
  }

  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n))) return false

  const [a, b] = parts

  if (a === 127) return true
  if (a === 10) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 169 && b === 254) return true

  return false
}

export function pickCountry(headers: Headers) {
  const v = headers.get('cf-ipcountry')?.trim()
  if (!v || v.toUpperCase() === 'XX') return 'Unknown'
  return v.toUpperCase()
}
