import type { WorldTimeItem } from '@/features/time/lib/world-time'

type Props = {
  clocks: WorldTimeItem[]
}

export default function TimeSubClocks({ clocks }: Props) {
  return (
    <article className='w-full max-w-6xl px-4' data-testid='time-sub-clocks'>
      <div className='grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:justify-center'>
        {clocks.map(city => {
          const ampm = city.hour < 12 ? 'AM' : 'PM'

          return (
            <div
              key={city.timeZone}
              className='group relative overflow-hidden rounded-2xl px-6 py-4 transition-all duration-500 sm:w-[160px]'
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(100,140,255,0.07) 100%)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              <div className='flex items-center justify-between gap-3'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60'>
                  {city.label}
                </p>
                <span className='text-[9px] text-white/35'>{city.dateLabel}</span>
              </div>

              <div className='mt-1.5 flex items-end gap-1.5'>
                <p className='font-mono text-2xl font-light tabular-nums text-white/80 transition-colors duration-300 group-hover:text-white/95'>
                  {city.time}
                </p>
                <span className='mb-0.5 text-[10px] font-medium text-white/35'>{ampm}</span>
              </div>

              <div className='mt-1.5 flex items-center gap-2'>
                <p className='text-[9px] tabular-nums text-white/30'>{city.gmtOffsetLabel}</p>
              </div>

              <div
                className='absolute -bottom-4 -right-4 h-12 w-12 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100'
                style={{ background: 'rgba(100,140,255,0.25)' }}
              />
            </div>
          )
        })}
      </div>
    </article>
  )
}
