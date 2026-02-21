'use client'

import { motion } from 'framer-motion'
import { Flag, RotateCcw } from 'lucide-react'
import Image from 'next/image'

import { cn } from '@/lib/client'

import type { RaceStanding } from '../../lib/race-engine'
import type { RaceStatus } from '../../lib/types'

type ResultProps = {
  standings: RaceStanding[]
  status: RaceStatus
  participantCount: number
  onRestart: () => void
  onReset: () => void
}

export default function Result({ standings, status, participantCount, onRestart, onReset }: ResultProps) {
  const topThree = standings.slice(0, 3)
  const others = standings.slice(3)
  const isFinal = status === 'FINISH'
  const podiumOrder = [1, 0, 2]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      className='overflow-hidden rounded-2xl border border-white/10 bg-[#060a10]'
    >
      <div className='relative overflow-hidden border-b border-white/8 bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10 px-6 py-5 text-center'>
        <div className='pointer-events-none absolute inset-0 [background-image:radial-gradient(ellipse_at_50%_100%,rgba(250,204,21,0.12),transparent_60%)]' />
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
          className='text-3xl'
        >
          🏁
        </motion.div>
        <div className='mt-1 text-lg font-bold text-white'>경기 결과</div>
        <div className='mt-0.5 text-xs text-zinc-500'>
          {isFinal ? '최종 순위가 확정되었습니다' : '레이스 종료 후 순위가 표시됩니다'}
        </div>
      </div>

      <div className='px-6 py-6'>
        <div className='flex items-end justify-center gap-3'>
          {podiumOrder.map(rankIndex => {
            const entry = topThree[rankIndex]
            const rank = rankIndex + 1
            const isFirst = rank === 1

            const podiumHeights = { 1: 'h-28', 2: 'h-20', 3: 'h-16' }
            const podiumColors = {
              1: 'from-yellow-500/30 to-yellow-600/20 border-yellow-400/40',
              2: 'from-slate-400/20 to-slate-500/15 border-slate-400/30',
              3: 'from-orange-500/20 to-orange-600/15 border-orange-400/30',
            }
            const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }

            return (
              <motion.div
                key={entry?.id ?? `placeholder-${rank}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + rankIndex * 0.08, type: 'spring', stiffness: 200 }}
                className='flex flex-col items-center gap-2'
              >
                <div
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border p-3',
                    isFirst
                      ? 'border-yellow-400/40 bg-yellow-500/10 shadow-[0_0_30px_rgba(250,204,21,0.2)]'
                      : 'border-white/8 bg-white/4'
                  )}
                >
                  {isFirst && (
                    <motion.div
                      animate={{ rotate: [-5, 5, -5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className='text-xl'
                    >
                      👑
                    </motion.div>
                  )}
                  <Image
                    src={entry ? `/animals/${entry.animalKey}.png` : '/animals/cat.png'}
                    alt={entry?.name ?? '-'}
                    width={isFirst ? 52 : 40}
                    height={isFirst ? 52 : 40}
                    className={cn('drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]', !entry && 'opacity-25 grayscale')}
                  />
                  <span className={cn('font-bold', isFirst ? 'text-base text-white' : 'text-sm text-zinc-300')}>
                    {entry?.name ?? '-'}
                  </span>
                  <span className='text-lg'>{medals[rank as 1 | 2 | 3]}</span>
                </div>

                <div
                  className={cn(
                    'flex w-full min-w-[72px] items-center justify-center rounded-t-lg border bg-gradient-to-b font-black text-2xl',
                    podiumHeights[rank as 1 | 2 | 3],
                    podiumColors[rank as 1 | 2 | 3]
                  )}
                >
                  <span className={cn(rank === 1 ? 'text-yellow-300' : rank === 2 ? 'text-slate-300' : 'text-orange-300')}>
                    {rank}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {(isFinal ? others.length > 0 : participantCount > 3) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className='mt-5 rounded-xl border border-white/8 bg-white/3 p-4'
          >
            <div className='mb-3 text-[11px] font-semibold tracking-wider text-zinc-600 uppercase'>
              기타 순위
            </div>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4'>
              {isFinal
                ? others.map((entry, index) => (
                    <div key={entry.id} className='flex items-center gap-2 rounded-lg border border-white/6 bg-white/3 px-3 py-2'>
                      <span className='text-xs font-bold tabular-nums text-zinc-600'>{index + 4}</span>
                      <Image src={`/animals/${entry.animalKey}.png`} alt={entry.name} width={22} height={22} />
                      <span className='text-sm text-zinc-300'>{entry.name}</span>
                    </div>
                  ))
                : Array.from({ length: Math.max(0, participantCount - 3) }, (_, index) => (
                    <div key={`placeholder-other-${index}`} className='flex items-center gap-2 rounded-lg border border-white/6 bg-white/3 px-3 py-2'>
                      <span className='text-xs font-bold tabular-nums text-zinc-600'>{index + 4}</span>
                      <span className='text-sm text-zinc-500'>-</span>
                    </div>
                  ))}
            </div>
          </motion.div>
        )}

        <div className='mt-5 flex justify-center gap-3'>
          <button
            type='button'
            onClick={onRestart}
            className='relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/25 to-blue-500/20 px-6 text-sm font-bold text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.15)] transition-all hover:border-cyan-300/60 hover:text-white'
          >
            <Flag className='h-4 w-4' />
            다시 시작
          </button>
          <button
            type='button'
            onClick={onReset}
            className='inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm text-zinc-400 transition-all hover:border-white/20 hover:text-white'
          >
            <RotateCcw className='h-3.5 w-3.5' />
            초기화
          </button>
        </div>
      </div>
    </motion.div>
  )
}
