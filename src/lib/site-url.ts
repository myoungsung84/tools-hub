const DEFAULT_SITE_URL = 'http://localhost:3000'

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '')
}

function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const vercelUrl = process.env.VERCEL_URL?.trim()
  const raw = configured || (vercelUrl ? `https://${vercelUrl}` : DEFAULT_SITE_URL)

  try {
    return normalizeBaseUrl(new URL(raw).toString())
  } catch {
    return DEFAULT_SITE_URL
  }
}

export function getSiteUrl(path = '') {
  const baseUrl = resolveSiteUrl()
  if (!path) return baseUrl

  return new URL(path, baseUrl).toString()
}
