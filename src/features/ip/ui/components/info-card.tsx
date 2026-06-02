import type { ReactNode } from 'react'

type Props = {
  icon: ReactNode
  title: string
  main: string
  sub: string
  badge?: string
}

export default function InfoCard({ icon, title, main, sub, badge }: Props) {
  return (
    <div className='group relative overflow-hidden rounded-2xl border bg-neutral-900/40 p-4 text-left transition-all hover:border-white/20 hover:bg-neutral-900/60'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div className='p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors'>
            {icon}
          </div>
          <span className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
            {title}
          </span>
        </div>
        {badge && (
          <span className='text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground'>
            {badge}
          </span>
        )}
      </div>
      <div>
        <div className='text-sm font-semibold text-white/90 truncate'>{main}</div>
        <div className='text-xs text-muted-foreground mt-1'>{sub}</div>
      </div>
    </div>
  )
}
