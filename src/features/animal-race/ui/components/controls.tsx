'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Flag, RotateCcw } from 'lucide-react'

import { cn } from '@/lib/client'

import { MAX_PARTICIPANTS, MIN_PARTICIPANTS } from '../../lib/constants'
import type { RaceStatus } from '../../lib/types'

type ControlsProps = {
  participantCount: number
  status: RaceStatus
  onChangeCount: (count: number) => void
  onStart: () => void
  onReset: () => void
}

export default function Controls({ participantCount, status, onChangeCount, onStart, onReset }: ControlsProps) {
  const disabled = status === 'COUNTDOWN' || status === 'RACING'

  const dec = () => {
    if (participantCount > MIN_PARTICIPANTS) onChangeCount(participantCount - 1)
  }
  const inc = () => {
    if (participantCount < MAX_PARTICIPANTS) onChangeCount(participantCount + 1)
  }

  return (
    <div className='flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm'>
      <div className='flex items-center gap-1'>
        <span className='mr-2 text-xs font-medium tracking-wider text-zinc-500 uppercase'>참가자</span>
        <button
          type='button'
          onClick={dec}
          disabled={disabled || participantCount <= MIN_PARTICIPANTS}
          className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30'
        >
          <ChevronLeft className='h-4 w-4' />
        </button>
        <div className='flex h-9 w-12 items-center justify-center rounded-lg border border-white/15 bg-white/8 text-sm font-bold tabular-nums text-white'>
          {participantCount}
        </div>
        <button
          type='button'
          onClick={inc}
          disabled={disabled || participantCount >= MAX_PARTICIPANTS}
          className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30'
        >
          <ChevronRight className='h-4 w-4' />
        </button>
        <span className='ml-1 text-xs text-zinc-600'>
          ({MIN_PARTICIPANTS}–{MAX_PARTICIPANTS}명)
        </span>
      </div>

      <div className='hidden items-center gap-1 sm:flex'>
        {[4, 6, 8, 10, 14].map(n => (
          <button
            key={n}
            type='button'
            onClick={() => !disabled && onChangeCount(n)}
            disabled={disabled}
            className={cn(
              'h-7 rounded-md px-2.5 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40',
              participantCount === n
                ? 'border border-cyan-400/50 bg-cyan-500/20 text-cyan-300'
                : 'border border-white/8 bg-white/4 text-zinc-500 hover:border-white/15 hover:text-zinc-300'
            )}
          >
            {n}
          </button>
        ))}
      </div>

      <div className='ml-auto flex items-center gap-2'>
        <button
          type='button'
          onClick={onReset}
          className='inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-zinc-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white'
        >
          <RotateCcw className='h-3.5 w-3.5' />
          <span>초기화</span>
        </button>

        <button
          type='button'
          onClick={onStart}
          disabled={disabled}
          className={cn(
            'relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-xl px-5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50',
            'border border-cyan-400/40 bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-200',
            'hover:border-cyan-300/60 hover:from-cyan-500/35 hover:to-blue-500/30 hover:text-white',
            'shadow-[0_0_20px_rgba(34,211,238,0.15)]'
          )}
        >
          <Flag className='h-4 w-4' />
          {status === 'FINISH' ? '다시 시작' : '시작'}
          {!disabled && (
            <motion.div
              className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent'
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </button>
      </div>
    </div>
  )
}
