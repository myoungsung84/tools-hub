import type { Metadata } from 'next'

import { TextCountPage } from '@/features/text-count'

export const metadata: Metadata = {
  title: '글자 수 세기 | Tools Hub',
  description: '텍스트의 글자 수, 단어 수 등을 빠르게 계산하세요.',
  alternates: {
    canonical: '/count',
  },
  openGraph: {
    title: '글자 수 세기 | Tools Hub',
    description: '텍스트의 글자 수, 단어 수 등을 빠르게 계산하세요.',
    url: '/count',
  },
}

export default function Page() {
  return <TextCountPage />
}
