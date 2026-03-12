import type { Metadata } from 'next'

import { WeatherPage } from '@/features/weather'

export const metadata: Metadata = {
  title: '세계 날씨 | 실시간 · 시간별 예보 - Tools Hub',
  description:
    '전 세계 주요 도시의 현재 날씨와 시간별 예보를 한 화면에서 빠르게 확인할 수 있는 세계 날씨 도구입니다.',
  alternates: {
    canonical: '/weather',
  },
  openGraph: {
    title: '세계 날씨 | Tools Hub',
    description: '전 세계 주요 도시의 실시간 날씨와 시간별 예보를 쉽고 빠르게 확인하세요.',
    url: '/weather',
  },
}

export default function Page() {
  return <WeatherPage />
}
