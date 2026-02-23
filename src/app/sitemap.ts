import type { MetadataRoute } from 'next'

import { TOOLS_NAV } from '@/lib/constants/tools-nav'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!
  const now = new Date()

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...TOOLS_NAV.map(item => ({
      url: `${baseUrl}${item.href}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: item.priority,
    })),
  ]

  return routes
}
