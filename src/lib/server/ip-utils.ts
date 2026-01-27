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

/**
 * 클라이언트 IP 추출 + 정규화
 * - ::1  → 127.0.0.1
 */
export function pickClientIp(headers: Headers): string {
  const ip =
    header(headers, 'cf-connecting-ip') ??
    header(headers, 'x-real-ip') ??
    header(headers, 'x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'

  // IPv6 loopback → IPv4 loopback
  if (ip === '::1') return '127.0.0.1'

  return ip
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

/**
 * 사설 / 로컬 IP 여부 판별
 */
export function isPrivateIp(ip: string): boolean {
  if (!ip) return false

  // IPv6 loopback
  if (ip === '::1') return true

  // IPv6 ULA (fc00::/7), link-local (fe80::/10)
  if (ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80')) {
    return true
  }

  // IPv4
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n))) return false

  const [a, b] = parts

  // 127.0.0.1/8 (loopback)
  if (a === 127) return true

  // 10.0.0.0/8
  if (a === 10) return true

  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true

  // 192.168.0.0/16
  if (a === 192 && b === 168) return true

  // 169.254.0.0/16 (link-local)
  if (a === 169 && b === 254) return true

  return false
}
