import type { Metadata } from 'next'

import { AgePage } from '@/features/age'

export const metadata: Metadata = {
  title: '만 나이 계산기 | 나이·띠·별자리·간지 - Tools Hub',
  description: '생년월일로 만 나이, 띠(기준 선택), 별자리, 간지(무슨 년)를 계산합니다.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/age`,
  },
  openGraph: {
    title: '만 나이 계산기 | Tools Hub',
    description: '만 나이, 띠, 별자리, 간지를 한 번에 계산해보세요.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/age`,
  },
}

export default function Page() {
  return <AgePage />
}
