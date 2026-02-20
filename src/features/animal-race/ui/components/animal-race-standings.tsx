'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import * as React from 'react'

import { Button } from '@/components/ui/button'

import type { Participant } from '../../lib/animal-race.types'


const buildRankBadge = (rank: number) => {
  if (rank === 0) return '🥇'
  if (rank === 1) return '🥈'
  if (rank === 2) return '🥉'
  return `#${rank + 1}`
}

type AnimalRaceStandingsProps = {
  participants: Participant[]
  progressMap: Record<string, number>
}

export default function AnimalRaceStandings({ participants, progressMap }: AnimalRaceStandingsProps) {
  const [showAllMobile, setShowAllMobile] = React.useState(false)

  const sorted = [...participants].sort((a, b) => (progressMap[b.id] ?? 0) - (progressMap[a.id] ?? 0))
  const mobileItems = showAllMobile ? sorted : sorted.slice(0, 3)

  return (
    <section className='rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm'>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-white'>Standings</h3>
        <Button
          type='button'
          variant='ghost'
          onClick={() => setShowAllMobile((prev) => !prev)}
          className='text-xs md:hidden'
        >
          {showAllMobile ? '접기' : '전체 보기'}
        </Button>
      </div>

      <div className='space-y-2 md:hidden'>
        <AnimatePresence initial={false}>
          {mobileItems.map((participant, index) => (
            <motion.div
              key={participant.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2'
            >
              <div className='flex items-center gap-2'>
                <span className='inline-flex min-w-8 items-center justify-center rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/90'>{buildRankBadge(index)}</span>
                <Image src={`/animals/${participant.animalKey}.png`} alt={participant.name} width={32} height={32} />
                <span className='text-sm text-white'>{participant.name}</span>
              </div>
              <span className='text-xs text-white/60'>{Math.round((progressMap[participant.id] ?? 0) * 100)}%</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className='hidden space-y-2 md:block'>
        {sorted.map((participant, index) => (
          <motion.div
            key={participant.id}
            layout
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className='flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2'
          >
            <div className='flex items-center gap-2'>
              <span className='inline-flex min-w-10 items-center justify-center rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/90'>{buildRankBadge(index)}</span>
              <Image src={`/animals/${participant.animalKey}.png`} alt={participant.name} width={36} height={36} />
              <span className='text-sm text-white'>{participant.name}</span>
            </div>
            <span className='text-xs text-white/60'>{Math.round((progressMap[participant.id] ?? 0) * 100)}%</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
