import Link from 'next/link'

import BackgroundSceneRotator from '@/components/layout/background/background-scene-rotator'
import { TOOLS_NAV } from '@/lib/constants/tools-nav'

export default function HomePage() {
  const tools = [...TOOLS_NAV].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

  return (
    <div className='relative w-full flex flex-1 flex-col items-center justify-center gap-0'>
      <BackgroundSceneRotator />

      <div
        className='pointer-events-none absolute inset-0 z-[1]'
        style={{
          background:
            'radial-gradient(ellipse 70% 65% at 50% 52%, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 70%, transparent 100%)',
        }}
      />

      <div className='relative z-10 flex flex-col items-center text-center px-6'>
        <p className='text-[13px] font-semibold uppercase tracking-[0.35em] text-white/60'>
          Tools Hub
        </p>

        <h1
          className='mt-4 text-[clamp(2.4rem,5.5vw,4rem)] font-bold leading-[1.1] tracking-tight text-white'
          style={{ textShadow: '0 2px 40px rgba(0,0,0,0.7)' }}
        >
          자주 쓰는 도구,{' '}
          <span className='text-white/50' style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            한곳에.
          </span>
        </h1>

        <p
          className='mt-5 text-[14px] leading-[1.9] text-white/60'
          style={{ textShadow: '0 1px 20px rgba(0,0,0,0.8)' }}
        >
          검색하거나 북마크를 뒤질 필요 없이,
          <br />
          필요한 도구를 바로 꺼내 쓰세요.
        </p>
      </div>

      <div className='relative z-10 mt-10 grid w-full max-w-[900px] grid-cols-1 gap-3 px-6 sm:grid-cols-2 lg:grid-cols-3'>
        {tools.map(tool => {
          const Icon = tool.icon

          return (
            <Link
              key={tool.href}
              href={tool.href}
              className='group relative flex items-center gap-4 overflow-hidden rounded-2xl px-5 py-4 transition-all duration-300 hover:-translate-y-[2px]'
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
              }}
            >
              <div
                className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                style={{
                  background:
                    'radial-gradient(ellipse 80% 80% at 0% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)',
                }}
              />

              <div
                className='relative grid size-10 shrink-0 place-items-center rounded-xl transition-all duration-300 group-hover:scale-105'
                style={{
                  background: 'rgba(255,255,255,0.09)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Icon
                  size={17}
                  className='text-white/65 transition-colors duration-300 group-hover:text-white/90'
                />
              </div>

              <div className='relative min-w-0 flex-1'>
                <div className='truncate text-[14px] font-semibold text-white/90 transition-colors duration-300 group-hover:text-white'>
                  {tool.label.ko}
                </div>
                <div className='mt-0.5 truncate text-[11px] text-white/35 transition-colors duration-300 group-hover:text-white/50'>
                  {tool.label.en}
                </div>
              </div>

              <span className='relative shrink-0 text-[12px] text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/55'>
                →
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
