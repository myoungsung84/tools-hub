import type { Metadata } from 'next'

import { CalendarPage } from '@/features/calendar'

export const metadata: Metadata = {
  title: '양력·음력 캘린더 구조 | Tools Hub',
  description: 'dayjs + manseryeok 기반 달력 구조 설계(양력/음력/절기/공휴일).',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/calendar`,
  },
  openGraph: {
    title: '양력·음력 캘린더 구조 | Tools Hub',
    description: '양력/음력/절기/공휴일 달력 구현을 위한 구조를 먼저 제안합니다.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/calendar`,
  },
}

export default function Page() {
  return <CalendarPage />
}
