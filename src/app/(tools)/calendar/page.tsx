import type { Metadata } from 'next'

import { CalendarPage } from '@/features/calendar'
import { getSiteUrl } from '@/lib/site-url'

// Prevent static prerender to avoid hydration mismatch (time-based rendering like todayKey/dayjs)
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '음력 달력 | 오늘 음력 날짜·공휴일·절기 확인 - Tools Hub',
  description:
    '오늘 음력 날짜를 확인하고, 양력·공휴일·절기 정보를 한눈에 볼 수 있는 음력 달력입니다. 음력 양력 변환과 기념일 정보도 함께 제공합니다.',
  alternates: {
    canonical: getSiteUrl('/calendar'),
  },
  openGraph: {
    title: '음력 달력 | 오늘 음력·공휴일 확인',
    description:
      '양력과 음력 날짜, 절기, 공휴일을 함께 확인할 수 있는 통합 달력입니다. 오늘 음력 날짜와 기념일 정보까지 제공합니다.',
    url: getSiteUrl('/calendar'),
  },
}

export default function Page() {
  return <CalendarPage />
}
