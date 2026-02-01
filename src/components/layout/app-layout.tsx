'use client'

import { Cat, Menu } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/client'
import { TOOLS_NAV } from '@/lib/constants/tools-nav'

function getActiveLabel(pathname: string) {
  const hit = TOOLS_NAV.find(x => x.href === pathname)
  return hit?.label.ko ?? 'Tools'
}

const headerIconBtn =
  'inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted/30 text-foreground transition hover:bg-muted/60'

const drawerIconBox = 'inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted/30'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activeLabel = getActiveLabel(pathname)

  return (
    <div className='min-h-dvh flex flex-col'>
      <header className='h-14 border-b px-4 sm:px-6 flex items-center gap-3'>
        <Sheet>
          {/* Left Trigger */}
          <SheetTrigger asChild>
            <button type='button' aria-label='Open menu' className={cn(headerIconBtn)}>
              <Menu className='h-4 w-4' />
            </button>
          </SheetTrigger>

          {/* Logo */}
          <Link href='/' className='flex items-center gap-2 shrink-0'>
            <Image src='/logo.svg' alt='Tools Hub' width={18} height={18} priority />
            <span className='text-sm font-semibold'>Tools Hub</span>
          </Link>

          {/* Current page label opens menu */}
          <SheetTrigger asChild>
            <button
              type='button'
              aria-label='Open menu'
              className={cn(
                'hidden sm:flex items-center gap-2 text-sm opacity-70 transition',
                'hover:opacity-100 cursor-pointer'
              )}
            >
              <span>/</span>
              <span className='font-medium opacity-90'>{activeLabel}</span>
            </button>
          </SheetTrigger>

          <div className='ml-auto' />

          {/* GitHub */}
          <a
            href='https://github.com/myoungsung84/tools-hub'
            target='_blank'
            rel='noreferrer'
            aria-label='GitHub'
            className={cn(headerIconBtn)}
          >
            <Cat className='h-4 w-4' />
          </a>

          {/* Drawer Content */}
          <SheetContent
            side='left'
            className='w-[280px]'
            aria-describedby={undefined}
            showCloseButton={false}
          >
            <SheetHeader className='border-b px-4 py-4'>
              <SheetTitle className='flex items-center gap-2'>
                <Image src='/logo.svg' alt='Tools Hub' width={18} height={18} />
                <span className='text-sm font-semibold'>Tools Hub</span>
              </SheetTitle>
            </SheetHeader>

            <nav className='p-2 flex flex-col gap-1'>
              {TOOLS_NAV.map(item => {
                const active = pathname === item.href
                const Icon = item.icon

                return (
                  <SheetClose key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                        active
                          ? 'bg-muted font-medium'
                          : 'hover:bg-muted/60 opacity-90 hover:opacity-100'
                      )}
                    >
                      <span className={cn(drawerIconBox)}>
                        <Icon className='h-4 w-4' />
                      </span>

                      <div className='min-w-0'>
                        <div className='leading-none'>{item.label.ko}</div>
                        <div className='mt-1 text-xs opacity-60 truncate'>{item.label.en}</div>
                      </div>
                    </Link>
                  </SheetClose>
                )
              })}
            </nav>

            <div className='mt-auto p-1 border-t'>
              <SheetClose asChild>
                <Link
                  href='/'
                  className={cn(
                    'block rounded-lg px-3 py-2 text-sm transition opacity-90 cursor-pointer',
                    'hover:bg-muted/60 hover:opacity-100'
                  )}
                >
                  홈으로
                </Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className='flex flex-1 justify-center'>
        <div className='flex flex-1 max-w-[1100px] px-6 pt-12 pb-24'>{children}</div>
      </main>
    </div>
  )
}
