import { AnimatePresence, motion } from 'framer-motion'

import { CHOICE_ORDER, CHOICES } from '../../lib/decide.data'
import { SPIN_MS } from '../../lib/decide.math'
import { wedgePath } from '../../lib/decide.svg'
import DecideConfetti from './decide-confetti'

type Props = {
  rotation: number
  isSpinning: boolean
  showConfetti: boolean
}

export default function DecideWheel({ rotation, isSpinning, showConfetti }: Props) {
  return (
    <div className='relative w-full max-w-[440px]'>
      <div className='absolute inset-0 -z-10 animate-pulse rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl' />

      <motion.svg
        className='absolute left-1/2 top-[-8px] z-10 -translate-x-1/2 drop-shadow-lg sm:top-[-12px]'
        width='24'
        height='18'
        viewBox='0 0 32 24'
        fill='currentColor'
        animate={isSpinning ? { y: [0, -4, 0] } : {}}
        transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.5 }}
      >
        <polygon points='16,24 0,0 32,0' className='text-foreground' />
      </motion.svg>

      <motion.div
        className='relative aspect-square w-full overflow-hidden rounded-full border-2 border-border/60 shadow-2xl sm:border-4'
        style={{
          boxShadow: '0 0 60px rgba(0,0,0,0.3), inset 0 0 30px rgba(255,255,255,0.05)',
        }}
        animate={{ rotate: rotation }}
        transition={{ duration: SPIN_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg viewBox='0 0 100 100' className='h-full w-full'>
          {CHOICE_ORDER.map((key, i) => {
            const wedgeStart = -90 + i * 30
            const wedgeEnd = wedgeStart + 30

            const labelAngle = wedgeStart + 15
            const labelRad = (labelAngle * Math.PI) / 180
            const labelRadius = 35
            const labelX = Number((50 + labelRadius * Math.cos(labelRad)).toFixed(2))
            const labelY = Number((50 + labelRadius * Math.sin(labelRad)).toFixed(2))

            return (
              <g key={key}>
                <path
                  d={wedgePath(50, 50, 49.5, wedgeStart, wedgeEnd)}
                  fill={CHOICES[key].color}
                  className='transition-opacity duration-300'
                />
                <text
                  x={labelX}
                  y={labelY}
                  fill='white'
                  fontSize='4'
                  fontWeight='600'
                  textAnchor='middle'
                  dominantBaseline='middle'
                  className='pointer-events-none select-none'
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                >
                  {CHOICES[key].emoji}
                </text>
              </g>
            )
          })}
          <circle cx='50' cy='50' r='15' fill='hsl(var(--background))' opacity='0.95' />
          <circle
            cx='50'
            cy='50'
            r='15'
            fill='none'
            stroke='hsl(var(--border))'
            strokeWidth='0.5'
          />
        </svg>
      </motion.div>

      <AnimatePresence>{showConfetti && <DecideConfetti />}</AnimatePresence>
    </div>
  )
}
