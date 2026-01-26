import './globals.css'

import type { Metadata } from 'next'
import { Geist_Mono, Noto_Sans_KR } from 'next/font/google'

const fontSans = Noto_Sans_KR({
  variable: '--font-sans',
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const fontMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tools Hub',
  description: 'Internal tools',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko' className='dark'>
      <body className={`${fontSans.variable} ${fontMono.variable} min-h-dvh`}>{children}</body>
    </html>
  )
}
