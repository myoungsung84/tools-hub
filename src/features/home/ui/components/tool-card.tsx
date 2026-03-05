import Link from 'next/link'
import type { ComponentType } from 'react'

export default function ToolCard({
  tool,
}: {
  tool: {
    href: string
    icon: ComponentType<{ size?: number; className?: string }>
    label: { ko: string; en: string }
  }
}) {
  const Icon = tool.icon

  return (
    <Link
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
}
