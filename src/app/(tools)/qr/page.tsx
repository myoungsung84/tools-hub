import type { Metadata } from 'next'

import { QrPage } from '@/features/qr'

export const metadata: Metadata = {
  title: 'QR 코드 생성기 | Tools Hub',
  description:
    '텍스트/URL로 QR 코드를 생성하고 PNG/SVG로 다운로드하세요. 배경색/전경색도 변경 가능합니다.',
  alternates: {
    canonical: '/qr',
  },
  openGraph: {
    title: 'QR 코드 생성기 | Tools Hub',
    description: '텍스트/URL로 QR 코드를 생성하고 PNG/SVG로 다운로드하세요.',
    url: '/qr',
  },
}

export default function Page() {
  return <QrPage />
}
