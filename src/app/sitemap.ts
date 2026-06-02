import type { MetadataRoute } from 'next'

import { TOOLS_NAV } from '@/lib/constants/tools-nav'
import { getSiteUrl } from '@/lib/site-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const routes: MetadataRoute.Sitemap = [
    {
      url: getSiteUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...TOOLS_NAV.map(item => ({
      url: getSiteUrl(item.href),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: item.priority,
    })),
  ]

  return routes
}
