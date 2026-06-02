import './globals.css'

import type { Metadata } from 'next'
import { Geist_Mono, Noto_Sans_KR } from 'next/font/google'

import { getSiteUrl } from '@/lib/site-url'

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
  metadataBase: new URL(getSiteUrl()),

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },

  other: {
    'google-site-verification': 'yNjgAXkPNLEvsdqMQZj5fmUCd408ueZe3JwN2XVNfKU',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko' className='dark'>
      <body className={`${fontSans.variable} ${fontMono.variable} min-h-dvh`}>{children}</body>
    </html>
  )
}
