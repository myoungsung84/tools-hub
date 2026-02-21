import type { Metadata } from 'next'

import { AnimalRacePage } from '@/features/animal-race'

export const metadata: Metadata = {
  title: '동물 레이싱 | Tools Hub',
  description:
    '귀여운 동물들이 트랙 위에서 펼치는 랜덤 레이싱 게임입니다. 사다리 게임처럼 결과를 예측할 수 없는 재미를 즐겨보세요.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/animal-race`,
  },
  openGraph: {
    title: '동물 레이싱 | Tools Hub',
    description:
      '귀여운 동물들이 트랙 위에서 펼치는 랜덤 레이싱 게임입니다. 사다리 게임처럼 결과를 예측할 수 없는 재미를 즐겨보세요.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/animal-race`,
  },
}

export default function Page() {
  return <AnimalRacePage />
}
