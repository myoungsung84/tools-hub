'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Flag, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import PageHeader from '@/components/layout/page-header'
import { cn } from '@/lib/client'

import {
  computeStandings,
  type ProgressMap,
  type RaceParticipant,
  type RaceStanding,
  tickRace,
} from '../lib/race-engine'

type RaceStatus = 'READY' | 'COUNTDOWN' | 'RACING' | 'FINISH'

type AnimalPreset = {
  key: string
  name: string
}

const MIN_PARTICIPANTS = 2
const MAX_PARTICIPANTS = 14
const DEFAULT_PARTICIPANTS = 8
const COUNTDOWN_STEPS = [3, 2, 1, 'GO'] as const

const ANIMAL_PRESETS: AnimalPreset[] = [
  { key: 'cat', name: '고양이' },
  { key: 'dog', name: '강아지' },
  { key: 'duck', name: '오리' },
  { key: 'elephant', name: '코끼리' },
  { key: 'lion', name: '사자' },
  { key: 'otter', name: '수달' },
  { key: 'owl', name: '부엉이' },
  { key: 'panda', name: '판다' },
  { key: 'penguin', name: '펭귄' },
  { key: 'rabbit', name: '토끼' },
  { key: 'shark', name: '상어' },
  { key: 'sheep', name: '양' },
  { key: 'tiger', name: '호랑이' },
  { key: 'turtle', name: '거북이' },
]

function makeStableParticipants(count: number): RaceParticipant[] {
  return ANIMAL_PRESETS.slice(0, count).map((animal, index) => ({
    id: `${animal.key}-${index + 1}`,
    name: animal.name,
    animalKey: animal.key,
    seedOrder: index,
    baseSpeed: 0.2,
    burstStart: 50,
    burstEnd: 56,
    burstBoost: 0.03,
    sprintVolatility: 0.05,
  }))
}

function rerollStats(participants: RaceParticipant[]): RaceParticipant[] {
  return participants.map(participant => {
    const hasBurst = Math.random() < 0.72
    const burstStart = 42 + Math.random() * 24

    return {
      ...participant,
      baseSpeed: 0.16 + Math.random() * 0.11,
      burstStart,
      burstEnd: hasBurst ? burstStart + 5 + Math.random() * 3 : burstStart,
      burstBoost: hasBurst ? 0.06 + Math.random() * 0.09 : 0,
      sprintVolatility: 0.04 + Math.random() * 0.08,
    }
  })
}

function makeProgressMap(participants: RaceParticipant[]): ProgressMap {
  return Object.fromEntries(participants.map(p => [p.id, 0]))
}

type ControlsProps = {
  participantCount: number
  status: RaceStatus
  onChangeCount: (count: number) => void
  onStart: () => void
  onReset: () => void
}

function Controls({ participantCount, status, onChangeCount, onStart, onReset }: ControlsProps) {
  const disabled = status === 'COUNTDOWN' || status === 'RACING'

  const dec = () => {
    if (participantCount > MIN_PARTICIPANTS) onChangeCount(participantCount - 1)
  }
  const inc = () => {
    if (participantCount < MAX_PARTICIPANTS) onChangeCount(participantCount + 1)
  }

  return (
    <div className='flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm'>
      {/* 참가자 수 조절 */}
      <div className='flex items-center gap-1'>
        <span className='mr-2 text-xs font-medium tracking-wider text-zinc-500 uppercase'>
          참가자
        </span>
        <button
          onClick={dec}
          disabled={disabled || participantCount <= MIN_PARTICIPANTS}
          className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
        >
          <ChevronLeft className='h-4 w-4' />
        </button>
        <div className='flex h-9 w-12 items-center justify-center rounded-lg border border-white/15 bg-white/8 text-sm font-bold tabular-nums text-white'>
          {participantCount}
        </div>
        <button
          onClick={inc}
          disabled={disabled || participantCount >= MAX_PARTICIPANTS}
          className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
        >
          <ChevronRight className='h-4 w-4' />
        </button>
        <span className='ml-1 text-xs text-zinc-600'>
          ({MIN_PARTICIPANTS}–{MAX_PARTICIPANTS}명)
        </span>
      </div>

      {/* 빠른 선택 버튼 */}
      <div className='hidden items-center gap-1 sm:flex'>
        {[4, 6, 8, 10, 14].map(n => (
          <button
            key={n}
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
          onClick={onReset}
          className='inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-zinc-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white'
        >
          <RotateCcw className='h-3.5 w-3.5' />
          <span>초기화</span>
        </button>

        <button
          onClick={onStart}
          disabled={disabled}
          className={cn(
            'relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-xl px-5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed',
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

function Track({
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
      {/* 배경 그리드 */}
      <div className='pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:40px_40px]' />

      {/* HUD 헤더 */}
      <div className='relative z-20 flex items-center justify-between border-b border-white/8 bg-black/50 px-4 py-3 backdrop-blur-md'>
        {/* 왼쪽: 상태 + 1위 */}
        <div className='flex items-center gap-3'>
          {/* 상태 배지 */}
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

          {/* 1위 표시 */}
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

        {/* 오른쪽: Top 3 */}
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
                <Image
                  src={`/animals/${entry.animalKey}.png`}
                  alt={entry.name}
                  width={14}
                  height={14}
                />
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

      {/* 트랙 */}
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
                  {/* 리더 글로우 */}
                  {isLeader && (
                    <motion.div
                      animate={leaderPulseToken > 0 ? { opacity: [0, 0.4, 0] } : { opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className='pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_20%_50%,rgba(250,204,21,0.2),transparent_55%)]'
                    />
                  )}

                  <div className='relative flex h-[54px] items-center gap-0'>
                    {/* 레인 번호 + 동물 이름 */}
                    <div className='flex w-[88px] shrink-0 flex-col justify-center border-r border-white/6 pl-3 pr-2'>
                      <span className='text-[9px] font-medium text-zinc-600 leading-none'>
                        LANE {participant.seedOrder + 1}
                      </span>
                      <span className='mt-0.5 text-[12px] font-semibold leading-none text-zinc-200'>
                        {participant.name}
                      </span>
                    </div>

                    {/* 레이스 트랙 */}
                    <div className='relative flex flex-1 items-center px-2'>
                      {/* 점선 */}
                      <div
                        className='absolute inset-x-2 top-1/2 h-[1px] -translate-y-1/2 opacity-30'
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(to right, rgba(255,255,255,0.5) 0 8px, transparent 8px 16px)',
                          backgroundPositionX: `${trackFlowOffset * -2}px`,
                        }}
                      />

                      {/* 결승선 */}
                      <div className='absolute inset-y-0 right-[44px] z-20 w-[10px] border-l border-white/12 bg-[repeating-linear-gradient(135deg,rgba(30,30,30,0.9)_0_5px,rgba(200,200,200,0.9)_5px_10px)] bg-[length:10px_10px]' />
                      {/* 결승선 빛 효과 */}
                      <motion.div
                        animate={{ opacity: [0.15, 0.5, 0.15] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                        className='pointer-events-none absolute inset-y-0 right-[34px] z-20 w-10 bg-gradient-to-r from-transparent via-white/15 to-white/25'
                      />

                      {/* 동물 아이콘 */}
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

                      {/* 진행률 */}
                      {!showLaneRank && (
                        <div className='absolute right-[56px] z-10 text-[10px] tabular-nums text-zinc-600'>
                          {displayProgress.toFixed(0)}%
                        </div>
                      )}
                    </div>

                    {/* 순위 배지 */}
                    {(showLaneRank || laneFinished) && (
                      <div
                        className={cn(
                          'absolute right-1 top-1/2 z-30 -translate-y-1/2 flex h-8 w-10 items-center justify-center rounded-lg border-2 text-xs font-black shadow-lg',
                          laneRank === 1
                            ? 'border-yellow-300/70 bg-gradient-to-b from-yellow-400 to-yellow-500 text-black shadow-[0_0_16px_rgba(250,204,21,0.7)]'
                            : laneRank === 2
                              ? 'border-slate-200/60 bg-gradient-to-b from-slate-300 to-slate-400 text-slate-900 shadow-[0_0_12px_rgba(203,213,225,0.5)]'
                              : laneRank === 3
                                ? 'border-orange-300/60 bg-gradient-to-b from-orange-400 to-orange-500 text-white shadow-[0_0_12px_rgba(251,146,60,0.5)]'
                                : 'border-zinc-500/40 bg-zinc-700 text-zinc-300'
                        )}
                      >
                        {laneRank}위
                      </div>
                    )}
                  </div>

                  {/* 진행률 바 (하단) */}
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

      {/* 카운트다운 오버레이 */}
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
            <div className={cn('relative flex flex-col items-center gap-2')}>
              {/* 배경 링 */}
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

      {/* 리더 체인지 토스트 */}
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

      {/* GO 플래시 */}
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

      {/* 하단 정보 바 */}
      <div className='flex items-center justify-between border-t border-white/6 bg-black/30 px-4 py-2'>
        <div className='text-[10px] text-zinc-700'>{participants.length}마리 참가</div>
        <div className='text-[10px] tabular-nums text-zinc-700'>
          FLOW {trackFlowSpeed.toFixed(2)}
        </div>
      </div>

      {/* 런치 부스트 효과 */}
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

type ResultProps = {
  standings: RaceStanding[]
  onRestart: () => void
  onReset: () => void
}

function Result({ standings, onRestart, onReset }: ResultProps) {
  const topThree = standings.slice(0, 3)
  const others = standings.slice(3)

  const podiumOrder = [1, 0, 2] // 2위, 1위, 3위 순서로 시상대 배치

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      className='overflow-hidden rounded-2xl border border-white/10 bg-[#060a10]'
    >
      {/* 결과 헤더 */}
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
        <div className='mt-1 text-lg font-bold text-white'>경기 종료!</div>
        <div className='mt-0.5 text-xs text-zinc-500'>최종 순위가 확정되었습니다</div>
      </div>

      {/* 시상대 */}
      <div className='px-6 py-6'>
        <div className='flex items-end justify-center gap-3'>
          {podiumOrder.map(rankIndex => {
            const entry = topThree[rankIndex]
            if (!entry) return null
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
                key={entry.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + rankIndex * 0.08, type: 'spring', stiffness: 200 }}
                className='flex flex-col items-center gap-2'
              >
                {/* 동물 카드 */}
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
                    src={`/animals/${entry.animalKey}.png`}
                    alt={entry.name}
                    width={isFirst ? 52 : 40}
                    height={isFirst ? 52 : 40}
                    className='drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]'
                  />
                  <span
                    className={cn(
                      'font-bold',
                      isFirst ? 'text-base text-white' : 'text-sm text-zinc-300'
                    )}
                  >
                    {entry.name}
                  </span>
                  <span className='text-lg'>{medals[rank as 1 | 2 | 3]}</span>
                </div>

                {/* 시상대 블록 */}
                <div
                  className={cn(
                    'flex w-full min-w-[72px] items-center justify-center rounded-t-lg border bg-gradient-to-b font-black text-2xl',
                    podiumHeights[rank as 1 | 2 | 3],
                    podiumColors[rank as 1 | 2 | 3]
                  )}
                >
                  <span
                    className={cn(
                      rank === 1
                        ? 'text-yellow-300'
                        : rank === 2
                          ? 'text-slate-300'
                          : 'text-orange-300'
                    )}
                  >
                    {rank}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* 나머지 순위 */}
        {others.length > 0 && (
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
              {others.map((entry, index) => (
                <div
                  key={entry.id}
                  className='flex items-center gap-2 rounded-lg border border-white/6 bg-white/3 px-3 py-2'
                >
                  <span className='text-xs font-bold text-zinc-600 tabular-nums'>{index + 4}</span>
                  <Image
                    src={`/animals/${entry.animalKey}.png`}
                    alt={entry.name}
                    width={22}
                    height={22}
                  />
                  <span className='text-sm text-zinc-300'>{entry.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 버튼 */}
        <div className='mt-5 flex justify-center gap-3'>
          <button
            onClick={onRestart}
            className='relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/25 to-blue-500/20 px-6 text-sm font-bold text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.15)] transition-all hover:border-cyan-300/60 hover:text-white'
          >
            <Flag className='h-4 w-4' />
            다시 시작
          </button>
          <button
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

export default function AnimalRacePage() {
  const [participantCount, setParticipantCount] = useState(DEFAULT_PARTICIPANTS)
  const [participants, setParticipants] = useState<RaceParticipant[]>(() =>
    makeStableParticipants(DEFAULT_PARTICIPANTS)
  )
  const [progressMap, setProgressMap] = useState<ProgressMap>(() =>
    makeProgressMap(makeStableParticipants(DEFAULT_PARTICIPANTS))
  )
  const [status, setStatus] = useState<RaceStatus>('READY')
  const [countdownText, setCountdownText] = useState<string | null>(null)
  const [leaderPulseToken, setLeaderPulseToken] = useState(0)
  const [leaderChangeVisible, setLeaderChangeVisible] = useState(false)
  const [trackFlowOffset, setTrackFlowOffset] = useState(0)
  const [trackFlowSpeed, setTrackFlowSpeed] = useState(0)
  const [launchBoostActive, setLaunchBoostActive] = useState(false)
  const [goFlashVisible, setGoFlashVisible] = useState(false)

  const rafRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const timersRef = useRef<number[]>([])
  const leaderChangeTimerRef = useRef<number | null>(null)
  const participantsRef = useRef<RaceParticipant[]>(participants)
  const progressMapRef = useRef<ProgressMap>(progressMap)
  const physicsProgressRef = useRef<ProgressMap>(progressMap)
  const finishScoreByIdRef = useRef<Record<string, number>>({})
  const finishSequenceRef = useRef(0)
  const previousLeaderRef = useRef<string | null>(null)

  useEffect(() => {
    participantsRef.current = participants
  }, [participants])

  useEffect(() => {
    progressMapRef.current = progressMap
  }, [progressMap])

  const standings = useMemo(
    () => computeStandings(participants, progressMap),
    [participants, progressMap]
  )

  const clearTimers = useCallback(() => {
    for (const timerId of timersRef.current) window.clearTimeout(timerId)
    timersRef.current = []
  }, [])

  const clearLeaderChangeTimer = useCallback(() => {
    if (leaderChangeTimerRef.current !== null) {
      window.clearTimeout(leaderChangeTimerRef.current)
      leaderChangeTimerRef.current = null
    }
  }, [])

  const stopRaceLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastFrameRef.current = null
  }, [])

  const resetEffects = useCallback(() => {
    setCountdownText(null)
    setLeaderPulseToken(0)
    setLeaderChangeVisible(false)
    setTrackFlowOffset(0)
    setTrackFlowSpeed(0)
    setLaunchBoostActive(false)
    setGoFlashVisible(false)
    clearLeaderChangeTimer()
    finishScoreByIdRef.current = {}
    finishSequenceRef.current = 0
    previousLeaderRef.current = null
  }, [clearLeaderChangeTimer])

  const applyParticipants = useCallback((nextParticipants: RaceParticipant[]) => {
    const nextMap = makeProgressMap(nextParticipants)
    participantsRef.current = nextParticipants
    progressMapRef.current = nextMap
    physicsProgressRef.current = nextMap
    setParticipants(nextParticipants)
    setProgressMap(nextMap)
  }, [])

  const onReset = useCallback(() => {
    clearTimers()
    stopRaceLoop()
    resetEffects()
    const stable = makeStableParticipants(participantCount)
    applyParticipants(stable)
    setStatus('READY')
  }, [applyParticipants, clearTimers, participantCount, resetEffects, stopRaceLoop])

  const onStart = useCallback(() => {
    if (status === 'RACING' || status === 'COUNTDOWN') return

    clearTimers()
    stopRaceLoop()
    resetEffects()

    const rerolled = rerollStats(participantsRef.current)
    applyParticipants(rerolled)
    setStatus('COUNTDOWN')

    COUNTDOWN_STEPS.forEach((step, index) => {
      const timerId = window.setTimeout(() => {
        setCountdownText(String(step))
        if (step === 'GO') {
          setGoFlashVisible(true)
          setLaunchBoostActive(true)
        }
      }, index * 700)
      timersRef.current.push(timerId)
    })

    const runTimerId = window.setTimeout(
      () => {
        setCountdownText(null)
        setStatus('RACING')
      },
      COUNTDOWN_STEPS.length * 700 + 120
    )
    timersRef.current.push(runTimerId)
  }, [applyParticipants, clearTimers, resetEffects, status, stopRaceLoop])

  const onChangeCount = useCallback(
    (count: number) => {
      setParticipantCount(count)
      if (status === 'RACING' || status === 'COUNTDOWN') return

      clearTimers()
      stopRaceLoop()
      resetEffects()

      const stable = makeStableParticipants(count)
      applyParticipants(stable)
      setStatus('READY')
    },
    [applyParticipants, clearTimers, resetEffects, status, stopRaceLoop]
  )

  useEffect(() => {
    if (!goFlashVisible) return
    const timerId = window.setTimeout(() => setGoFlashVisible(false), 100)
    return () => window.clearTimeout(timerId)
  }, [goFlashVisible])

  useEffect(() => {
    if (!launchBoostActive) return
    const timerId = window.setTimeout(() => setLaunchBoostActive(false), 360)
    return () => window.clearTimeout(timerId)
  }, [launchBoostActive])

  useEffect(() => {
    if (!leaderChangeVisible) return
    const timerId = window.setTimeout(() => setLeaderChangeVisible(false), 800)
    return () => window.clearTimeout(timerId)
  }, [leaderChangeVisible])

  useEffect(() => {
    if (status !== 'RACING') return

    const tick = (timestamp: number) => {
      const last = lastFrameRef.current
      const deltaMs = last !== null ? timestamp - last : 16.7
      lastFrameRef.current = timestamp

      const currentParticipants = participantsRef.current
      const {
        nextProgressMap: rawNextProgressMap,
        finishedIds,
        allFinished,
      } = tickRace({
        participants: currentParticipants,
        prevProgressMap: physicsProgressRef.current,
        deltaMs,
      })
      physicsProgressRef.current = rawNextProgressMap

      if (finishedIds.length > 0) {
        const sortedFinishedIds = [...finishedIds].sort((a, b) => {
          const aProgress = rawNextProgressMap[a] ?? 0
          const bProgress = rawNextProgressMap[b] ?? 0
          if (bProgress !== aProgress) return bProgress - aProgress

          const aSeed = currentParticipants.find(p => p.id === a)?.seedOrder ?? 999
          const bSeed = currentParticipants.find(p => p.id === b)?.seedOrder ?? 999
          return aSeed - bSeed
        })

        for (const id of sortedFinishedIds) {
          if (finishScoreByIdRef.current[id] !== undefined) continue
          finishSequenceRef.current += 1
          finishScoreByIdRef.current[id] = 10000 - finishSequenceRef.current
        }
      }

      const rankedProgressMap: ProgressMap = { ...rawNextProgressMap }
      for (const [id, score] of Object.entries(finishScoreByIdRef.current)) {
        rankedProgressMap[id] = score
      }

      progressMapRef.current = rankedProgressMap
      setProgressMap(rankedProgressMap)

      const liveLeaderId = computeStandings(currentParticipants, rankedProgressMap)[0]?.id ?? null
      if (liveLeaderId) {
        if (previousLeaderRef.current !== null && previousLeaderRef.current !== liveLeaderId) {
          setLeaderPulseToken(prev => prev + 1)
          clearLeaderChangeTimer()
          setLeaderChangeVisible(true)
          leaderChangeTimerRef.current = window.setTimeout(() => {
            setLeaderChangeVisible(false)
            leaderChangeTimerRef.current = null
          }, 800)
        }
        previousLeaderRef.current = liveLeaderId
      }

      let sum = 0
      let leaderMax = 0
      for (const participant of currentParticipants) {
        const current = Math.min(rawNextProgressMap[participant.id] ?? 0, 100)
        sum += current
        if (current > leaderMax) leaderMax = current
      }

      const average = currentParticipants.length ? sum / currentParticipants.length : 0
      const speedBase = 0.24 + average * 0.0115
      const lateBoost = leaderMax >= 85 ? 1.3 : 1
      const launchBoost = launchBoostActive ? 2.2 : 1
      const flowSpeed = speedBase * lateBoost * launchBoost

      setTrackFlowSpeed(flowSpeed)
      setTrackFlowOffset(prev => (prev + flowSpeed * (deltaMs / 16.7)) % 1200)

      if (allFinished) {
        stopRaceLoop()
        setTrackFlowSpeed(0)
        setLaunchBoostActive(false)
        setStatus('FINISH')
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return stopRaceLoop
  }, [clearLeaderChangeTimer, launchBoostActive, status, stopRaceLoop])

  useEffect(() => {
    return () => {
      clearTimers()
      clearLeaderChangeTimer()
      stopRaceLoop()
    }
  }, [clearLeaderChangeTimer, clearTimers, stopRaceLoop])

  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 pb-12 pt-2 sm:px-4'>
      <PageHeader
        icon={Flag}
        kicker='Animal Race'
        title='동물 레이스'
        description='귀여운 동물들이 트랙 위에서 펼치는 랜덤 레이싱 게임입니다. 사다리 게임처럼 결과를 예측할 수 없는 재미를 즐겨보세요.'
      />

      <Controls
        participantCount={participantCount}
        status={status}
        onChangeCount={onChangeCount}
        onStart={onStart}
        onReset={onReset}
      />

      <Track
        status={status}
        participants={participants}
        progressMap={progressMap}
        standings={standings}
        countdownText={countdownText}
        leaderPulseToken={leaderPulseToken}
        leaderChangeVisible={leaderChangeVisible}
        trackFlowOffset={trackFlowOffset}
        trackFlowSpeed={trackFlowSpeed}
        launchBoostActive={launchBoostActive}
        goFlashVisible={goFlashVisible}
      />

      <AnimatePresence>
        {status === 'FINISH' && (
          <Result standings={standings} onRestart={onStart} onReset={onReset} />
        )}
      </AnimatePresence>
    </div>
  )
}
