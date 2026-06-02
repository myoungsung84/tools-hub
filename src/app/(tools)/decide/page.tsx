import type { Metadata } from 'next'

import DecidePage from '@/features/decide/ui/decide-page'
import { getSiteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: '살까 말까 결정 도우미 | Tools Hub',
  description:
    '살까 말까 고민될 때 사용하는 룰렛형 결정 도우미입니다. 버튼 한 번으로 빠르게 선택하고 재미있는 결과 메시지로 가볍게 결정을 도와줍니다.',
  alternates: {
    canonical: getSiteUrl('/decide'),
  },
  openGraph: {
    title: '살까 말까 결정 도우미 | Tools Hub',
    description:
      '살까 말까 고민될 때 빠르게 선택할 수 있는 룰렛형 결정 도구입니다. 구매, 일정, 선택지 결정을 가볍고 재미있게 도와줍니다.',
    url: getSiteUrl('/decide'),
  },
}

export default function Page() {
  return <DecidePage />
}
