import type { Metadata } from 'next'

import { WeatherPage } from '@/features/weather'

export const metadata: Metadata = {
  title: '날씨 | 실시간 · 시간별 예보 - Tools Hub',
  description:
    '국내/해외 주요 도시의 실시간 날씨와 시간별 예보를 한 화면에서 확인할 수 있는 도구입니다.',
  alternates: {
    canonical: '/weather',
  },
  openGraph: {
    title: '날씨 | Tools Hub',
    description: '국내/해외 주요 도시의 실시간 날씨와 시간별 예보를 한 화면에서 확인하세요.',
    url: '/weather',
  },
}

export default function Page() {
  return <WeatherPage />
}
