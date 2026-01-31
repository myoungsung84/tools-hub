import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  const now = new Date()

  const routes = ['/time', '/ip', '/count', '/qr', '/decide']

  return routes.map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: path === '/time' ? 0.9 : path === '/decide' ? 0.8 : 0.7,
  }))
}
