import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  const now = new Date()

  // ✅ 여기만 늘리면 됨 (툴 추가할 때)
  const routes = ['/time', '/ip']

  return routes.map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: path === '/time' ? 0.9 : 0.7,
  }))
}
