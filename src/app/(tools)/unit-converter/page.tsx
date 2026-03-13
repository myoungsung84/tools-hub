import type { Metadata } from 'next'

import { UnitConverterPage } from '@/features/unit-converter'

export const metadata: Metadata = {
  title: '단위 변환기 | Tools Hub',
  description:
    '길이, 무게, 면적, 온도, 데이터, 생활 단위를 한 번에 변환할 수 있는 단위 변환기입니다.',
  alternates: {
    canonical: '/unit-converter',
  },
  openGraph: {
    title: '단위 변환기 | Tools Hub',
    description: '자주 쓰는 단위를 빠르게 변환하세요.',
    url: '/unit-converter',
  },
}

export default function Page() {
  return <UnitConverterPage />
}
