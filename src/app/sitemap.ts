import type { MetadataRoute } from 'next'

import { TOOLS_NAV } from '@/lib/constants/tools-nav'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!
  const now = new Date()

  return TOOLS_NAV.map(item => ({
    url: `${baseUrl}${item.href}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: item.priority,
  }))
}
