'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useMemo } from 'react'

import { cn } from '@/lib/client'

import type { ProgressMap, RaceParticipant, RaceStanding } from '../../lib/race-engine'
import type { RaceStatus } from '../../lib/types'

type TrackProps = {
  status: RaceStatus
  participants: RaceParticipant[]
  progressMap: ProgressMap
  standings: RaceStanding[]
  countdownText: string | null
  leaderPulseToken: number
  leaderChangeVisible: boolean
  trackFlowOffset: number
  trackFlowSpeed: number
  launchBoostActive: boolean
  goFlashVisible: boolean
}

export default function Track({
  status,
  participants,
  progressMap,
  standings,
  countdownText,
  leaderPulseToken,
  leaderChangeVisible,
  trackFlowOffset,
  trackFlowSpeed,
  launchBoostActive,
  goFlashVisible,
}: TrackProps) {
  const showRankedOverlay = status === 'RACING'
  const showLaneRank = status === 'FINISH'
  const leader = standings[0]
  const topThree = standings.slice(0, 3)
  const laneRankById = useMemo(
    () => Object.fromEntries(standings.map((entry, index) => [entry.id, index + 1])),
    [standings]
  )

  return (
    <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-[#060a10] shadow-[0_24px_64px_rgba(0,0,0,0.6)]'>
      <div className='pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:40px_40px]' />

      <div className='relative z-20 flex items-center justify-between border-b border-white/8 bg-black/50 px-4 py-3 backdrop-blur-md'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase transition-all duration-300',
              status === 'RACING'
                ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                : status === 'FINISH'
                  ? 'border-yellow-400/40 bg-yellow-500/15 text-yellow-300'
                  : status === 'COUNTDOWN'
                    ? 'border-orange-400/40 bg-orange-500/15 text-orange-300'
                    : 'border-zinc-600/40 bg-zinc-700/20 text-zinc-400'
            )}
          >
            {status === 'RACING' && (
              <motion.span
                className='h-1.5 w-1.5 rounded-full bg-emerald-400'
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            {status}
          </div>

          {showRankedOverlay && leader ? (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-2.5 py-1 text-[11px]',
                leaderPulseToken > 0
                  ? 'border-yellow-300/50 bg-yellow-400/15 text-yellow-100'
                  : 'border-yellow-400/25 bg-yellow-500/8 text-yellow-200/80'
              )}
            >
              <span className='text-yellow-400'>👑</span>
              <span className='font-semibold'>{leader.name}</span>
            </motion.div>
          ) : (
            <div className='rounded-lg border border-white/8 bg-white/4 px-2.5 py-1 text-[11px] text-zinc-600'>
              리더 —
            </div>
          )}
        </div>

        <div className='hidden items-center gap-1 sm:flex'>
          {showRankedOverlay ? (
            topThree.map((entry, i) => (
              <motion.div
                key={entry.id}
                layout
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px]',
                  i === 0
                    ? 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200'
                    : 'border-white/8 bg-white/4 text-zinc-400'
                )}
              >
                <span className='font-bold text-zinc-500'>{i + 1}</span>
                <Image src={`/animals/${entry.animalKey}.png`} alt={entry.name} width={14} height={14} />
                <span>{entry.name}</span>
              </motion.div>
            ))
          ) : (
            <div className='rounded-lg border border-white/8 bg-white/4 px-2.5 py-1 text-[11px] text-zinc-600'>
              Top 3 —
            </div>
          )}
        </div>
      </div>

      <div className='relative max-h-[64vh] overflow-y-hidden p-3'>
        <div className='space-y-1.5'>
          {participants.map(participant => {
            const progress = progressMap[participant.id] ?? 0
            const displayProgress = Math.min(progress, 100)
            const laneRank = laneRankById[participant.id] ?? participants.length
            const laneFinished = progress >= 100
            const isLeader = showRankedOverlay && participant.id === leader?.id
            const isTop3 = showRankedOverlay && laneRank <= 3

            return (
              <div key={participant.id}>
                <div
                  className='relative overflow-hidden rounded-xl border border-white/8 bg-[#0b1120] transition-all duration-300'
                  style={{
                    borderColor: isLeader
                      ? 'rgba(250,204,21,0.3)'
                      : isTop3
                        ? 'rgba(255,255,255,0.1)'
                        : undefined,
                    boxShadow: isLeader
                      ? '0 0 20px rgba(250,204,21,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                  }}
                >
                  {isLeader && (
                    <motion.div
                      animate={leaderPulseToken > 0 ? { opacity: [0, 0.4, 0] } : { opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className='pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_20%_50%,rgba(250,204,21,0.2),transparent_55%)]'
                    />
                  )}

                  <div className='relative flex h-[54px] items-center gap-0'>
                    <div className='flex w-[88px] shrink-0 flex-col justify-center border-r border-white/6 pl-3 pr-2'>
                      <span className='text-[9px] leading-none font-medium text-zinc-600'>
                        LANE {participant.seedOrder + 1}
                      </span>
                      <span className='mt-0.5 text-[12px] leading-none font-semibold text-zinc-200'>
                        {participant.name}
                      </span>
                    </div>

                    <div className='relative flex flex-1 items-center px-2'>
                      <div
                        className='absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 opacity-45'
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(to right, rgba(255,255,255,0.7) 0 8px, transparent 8px 16px)',
                          backgroundPositionX: `${trackFlowOffset * -2}px`,
                        }}
                      />

                      <div className='absolute inset-y-0 right-[44px] z-20 w-[10px] border-l border-white/12 bg-[repeating-linear-gradient(135deg,rgba(30,30,30,0.9)_0_5px,rgba(200,200,200,0.9)_5px_10px)] bg-[length:10px_10px]' />
                      <motion.div
                        animate={{ opacity: [0.15, 0.5, 0.15] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        className='pointer-events-none absolute inset-y-0 right-[34px] z-20 w-10 bg-gradient-to-r from-transparent via-white/15 to-white/25'
                      />

                      <div className='absolute left-2 right-[54px]'>
                        <motion.div
                          className='absolute top-1/2 -translate-y-1/2'
                          style={{ left: `calc((100% - 36px) * ${displayProgress / 100})` }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className='relative'>
                            {isLeader && status === 'RACING' && (
                              <motion.div
                                className='absolute -inset-2 rounded-full bg-yellow-400/20 blur-sm'
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                              />
                            )}
                            <Image
                              src={`/animals/${participant.animalKey}.png`}
                              alt={participant.name}
                              width={36}
                              height={36}
                              className='relative drop-shadow-[0_3px_8px_rgba(0,0,0,0.8)]'
                            />
                          </div>
                        </motion.div>
                      </div>

                      {!showLaneRank && (
                        <div className='absolute right-[56px] z-10 text-[10px] tabular-nums text-zinc-600'>
                          {displayProgress.toFixed(0)}%
                        </div>
                      )}
                    </div>

                    {(showLaneRank || laneFinished) && (
                      <div
                        className={cn(
                          'absolute right-1 top-1/2 z-30 flex h-8 w-10 -translate-y-1/2 items-center justify-center rounded-lg border-2 text-xs font-black shadow-[0_0_14px_rgba(0,0,0,0.6)]',
                          laneRank === 1
                            ? 'border-yellow-100 bg-yellow-400 text-black shadow-[0_0_18px_rgba(250,204,21,0.85)]'
                            : laneRank === 2
                              ? 'border-slate-100 bg-slate-300 text-slate-900 shadow-[0_0_14px_rgba(203,213,225,0.75)]'
                              : laneRank === 3
                                ? 'border-orange-100 bg-orange-500 text-white shadow-[0_0_14px_rgba(251,146,60,0.75)]'
                                : 'border-cyan-100 bg-cyan-500 text-white shadow-[0_0_12px_rgba(34,211,238,0.7)]'
                        )}
                      >
                        {laneRank}위
                      </div>
                    )}
                  </div>

                  <div className='h-[2px] w-full overflow-hidden bg-white/4'>
                    <motion.div
                      className={cn(
                        'h-full',
                        isLeader ? 'bg-yellow-400' : isTop3 ? 'bg-cyan-400' : 'bg-zinc-600'
                      )}
                      style={{ width: `${displayProgress}%` }}
                      transition={{ duration: 0.15 }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {countdownText && (
          <motion.div
            key={countdownText}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.3 }}
            transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
            className='absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm'
          >
            <div className='relative flex flex-col items-center gap-2'>
              <motion.div
                className={cn(
                  'absolute rounded-full border-2 opacity-30',
                  countdownText === 'GO' ? 'border-emerald-400' : 'border-cyan-400'
                )}
                style={{ width: 160, height: 160 }}
                animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              <div
                className={cn(
                  'rounded-2xl border px-12 py-7 text-7xl font-black sm:text-9xl',
                  countdownText === 'GO'
                    ? 'border-emerald-300/50 bg-emerald-500/20 text-emerald-100 shadow-[0_0_60px_rgba(52,211,153,0.4)]'
                    : 'border-cyan-300/40 bg-cyan-500/15 text-cyan-100 shadow-[0_0_60px_rgba(34,211,238,0.3)]'
                )}
              >
                {countdownText}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {leaderChangeVisible && status === 'RACING' && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className='absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-lg border border-amber-300/50 bg-amber-400/20 px-4 py-1.5 text-xs font-bold text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.3)] backdrop-blur-sm'
          >
            ⚡ LEADER CHANGE
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {goFlashVisible && (
          <motion.div
            initial={{ opacity: 0.25 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className='pointer-events-none absolute inset-0 z-50 bg-white'
          />
        )}
      </AnimatePresence>

      <div className='flex items-center justify-between border-t border-white/6 bg-black/30 px-4 py-2'>
        <div className='text-[10px] text-zinc-700'>{participants.length}마리 참가</div>
        <div className='text-[10px] tabular-nums text-zinc-700'>
          FLOW {trackFlowSpeed.toFixed(2)}
        </div>
      </div>

      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-20 transition-opacity duration-300',
          launchBoostActive
            ? 'opacity-100 bg-gradient-to-b from-orange-400/12 to-transparent'
            : 'opacity-0'
        )}
      />
    </div>
  )
}
