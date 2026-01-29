'use client'

import { Cat } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TOOLS_NAV = [
  { href: '/time', label: '현재시간' },
  { href: '/ip', label: '나의 아이피' },
] as const

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className='min-h-dvh flex flex-col'>
      {/* Top Navbar */}
      <header className='h-14 border-b px-6 flex items-center gap-6'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-2'>
          <Image src='/logo.svg' alt='Tools Hub' width={18} height={18} priority />
          <span className='text-sm font-semibold'>Tools Hub</span>
        </Link>

        <nav className='flex items-center gap-1'>
          {TOOLS_NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'rounded-md px-3 py-2 text-sm transition',
                  active
                    ? 'bg-muted font-medium'
                    : 'hover:bg-muted/60 opacity-80 hover:opacity-100',
                ].join(' ')}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className='ml-auto' />

        {/* GitHub */}
        <a
          href='https://github.com/myoungsung84/tools-hub'
          target='_blank'
          rel='noreferrer'
          aria-label='GitHub'
          className='ml-2 inline-flex h-9 w-9 items-center justify-center
           rounded-full
           bg-muted/30
           text-foreground
           transition
           hover:bg-muted/60'
        >
          <Cat className='h-4 w-4' />
        </a>
      </header>

      {/* Main */}
      <main className='flex flex-1 overflow-auto p-4'>{children}</main>
    </div>
  )
}
