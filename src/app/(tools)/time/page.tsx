import type { Metadata } from 'next'

import { TimePageUI } from '@/features/time'

export const metadata: Metadata = {
  title: '현재 시간 | 한국 표준시(KST) · 세계 시간 확인 - Tools Hub',
  description:
    '한국 표준시(KST)를 기준으로 현재 시간을 실시간으로 확인하세요. 서버 기준으로 정확한 현재 시간을 제공합니다.',
  alternates: { canonical: '/time' },
  openGraph: {
    title: '현재 시간 | Tools Hub',
    description: '한국 표준시(KST) 기준의 현재 시간을 실시간으로 확인할 수 있는 도구입니다.',
    url: '/time',
  },
}

export default function TimePage() {
  return (
    <>
      <h1 className='sr-only'>현재 시간</h1>
      <p className='sr-only'>
        한국 표준시(KST)를 기준으로 현재 시간을 실시간으로 표시하는 도구입니다.
      </p>
      <TimePageUI />
    </>
  )
}
