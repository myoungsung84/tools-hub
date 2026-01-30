import type { Metadata } from 'next'

import { IpPage } from '@/features/ip'

export const metadata: Metadata = {
  title: '나의 아이피 주소 확인 | IP 조회 - Tools Hub',
  description:
    '현재 접속한 나의 아이피(IP) 주소를 즉시 확인하세요. 공인 IP, 사설 IP 여부와 브라우저·OS 등 접속 정보를 함께 표시합니다.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/ip`,
  },
  openGraph: {
    title: '나의 아이피 주소 확인 | Tools Hub',
    description:
      '현재 접속한 IP 주소를 즉시 확인하세요. 공인/사설 IP 여부와 접속 정보를 확인할 수 있습니다.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/ip`,
  },
}

export default function Page() {
  return (
    <>
      <h1 className='sr-only'>나의 아이피 주소 확인</h1>
      <p className='sr-only'>
        현재 접속한 IP 주소와 공인·사설 여부, 브라우저 및 운영체제 정보를 확인할 수 있는 도구입니다.
      </p>
      <IpPage />
    </>
  )
}
