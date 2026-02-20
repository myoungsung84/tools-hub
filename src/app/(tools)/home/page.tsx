import type { Metadata } from 'next'

import { HomePage } from '@/features/home'

export const metadata: Metadata = {
  title: 'Tools Hub — 자주 쓰는 도구, 한곳에.',
  description:
    '검색하거나 북마크를 뒤질 필요 없이, 자주 쓰는 온라인 도구를 한곳에서 바로 꺼내 쓰세요.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/home` },
  openGraph: {
    title: 'Tools Hub — 자주 쓰는 도구, 한곳에.',
    description:
      '검색하거나 북마크를 뒤질 필요 없이, 자주 쓰는 온라인 도구를 한곳에서 바로 꺼내 쓰세요.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
  },
}

export default function HomeFeaturedPage() {
  return (
    <>
      <h1 className='sr-only'>Tools Hub — 자주 쓰는 도구, 한곳에.</h1>
      <p className='sr-only'>
        현재 시간, IP 확인, QR 코드 생성 등 자주 쓰는 온라인 도구를 한곳에서 빠르게 사용할 수
        있습니다.
      </p>
      <HomePage />
    </>
  )
}
