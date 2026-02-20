'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

import { cn } from '@/lib/client'

import type { Participant } from '../../lib/animal-race.types'

type AnimalRaceTrackProps = {
  participants: Participant[]
  progressMap: Record<string, number>
  isRacing: boolean
  finishOrder: string[]
}

export default function AnimalRaceTrack({
  participants,
  progressMap,
  isRacing,
  finishOrder,
}: AnimalRaceTrackProps) {
  return (
    <section className='rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm'>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-white'>Track</h3>
        <span className='text-xs text-white/60'>{isRacing ? 'RACING...' : 'READY'}</span>
      </div>

      <div className='h-[60svh] space-y-2 overflow-y-auto pr-1 md:h-auto md:max-h-none'>
        {participants.map((participant) => {
          const progress = progressMap[participant.id] ?? 0
          const rank = finishOrder.indexOf(participant.id)

          return (
            <div
              key={participant.id}
              className='group relative min-h-[64px] overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors md:hover:bg-white/[0.07]'
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 16px)',
              }}
            >
              <div className='absolute inset-x-0 top-1/2 border-t border-dashed border-white/15' />
              <div className='absolute bottom-1 left-2 text-xs text-white/60'>
                {participant.name}
                {rank >= 0 ? ` · ${rank + 1}위` : ''}
              </div>
              <div
                className='absolute right-0 top-0 h-full w-3 border-l border-white/20 opacity-50'
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(180deg, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 6px, transparent 6px, transparent 12px)',
                }}
              />

              <motion.div
                animate={{
                  x: `${progress * 86}%`,
                  y: isRacing ? [0, -2, 0] : 0,
                  rotate: isRacing ? [0, -2, 2, 0] : 0,
                  scale: progress >= 1 ? 1.08 : 1,
                }}
                transition={{
                  x: { duration: 0.14, ease: 'easeInOut' },
                  y: { duration: 0.5, repeat: isRacing ? Infinity : 0 },
                  rotate: { duration: 0.6, repeat: isRacing ? Infinity : 0 },
                  scale: { duration: 0.2 },
                }}
                className={cn('absolute left-1 top-1/2 -translate-y-1/2')}
              >
                <Image
                  src={`/animals/${participant.animalKey}.png`}
                  alt={participant.name}
                  width={96}
                  height={96}
                  className='h-14 w-14 object-contain md:h-20 md:w-20'
                />
              </motion.div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
