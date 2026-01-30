import type { Metadata } from 'next'

import DecidePage from '@/features/decide/ui/decide-page'

export const metadata: Metadata = {
  title: '살까 말까 결정 도우미 | Tools Hub',
  description:
    '이거 살까 말까 고민될 때? 버튼 한 번으로 운명에 맡겨보세요. 재미있는 룰렛 애니메이션과 재치 있는 결과 메시지로 결정을 도와드립니다.',
  alternates: {
    canonical: '/decide',
  },
  openGraph: {
    title: '살까 말까 결정 도우미 | Tools Hub',
    description:
      '구매 결정을 못 내리겠다면? 룰렛을 돌려 지금 사야 할지, 말아야 할지 재미있게 결정해보세요.',
    url: '/decide',
  },
}

export default function Page() {
  return <DecidePage />
}
