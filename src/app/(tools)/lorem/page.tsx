import type { Metadata } from 'next'

import { LoremPage } from '@/features/lorem'

export const metadata: Metadata = {
  title: '더미 텍스트 생성기 | 한국어·영어 랜덤 문장 - Tools Hub',
  description:
    '한국어/영어 더미 텍스트를 문단 수, 문장 밀도, 길이 옵션으로 빠르게 생성하세요. 복사 기능과 실시간 텍스트 통계를 함께 제공합니다.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/lorem`,
  },
  openGraph: {
    title: '더미 텍스트 생성기 | Tools Hub',
    description:
      '문단 수와 문장 옵션을 조절해 한국어/영어 더미 텍스트를 생성하고 바로 복사할 수 있는 도구입니다.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/lorem`,
  },
}

export default function Page() {
  return (
    <>
      <h1 className='sr-only'>더미 텍스트 생성기</h1>
      <p className='sr-only'>
        문단 수, 문장 밀도, 문장 길이 옵션으로 한국어와 영어 더미 텍스트를 생성하는 도구입니다.
      </p>
      <LoremPage />
    </>
  )
}
