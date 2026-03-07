import type { Metadata } from 'next'

import { IpLookupPage } from '@/features/ip-lookup'

export const metadata: Metadata = {
  title: 'IP 검색 | Tools Hub',
  description: 'IP 주소를 입력해 위치 및 ASN 정보를 조회합니다.',
  alternates: {
    canonical: '/ip-lookup',
  },
  openGraph: {
    title: 'IP 검색 | Tools Hub',
    description: 'IP 주소를 입력해 위치 및 ASN 정보를 조회합니다.',
    url: '/ip-lookup',
  },
}

export default function Page() {
  return <IpLookupPage />
}
