'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Zap } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/client'

import {
  computeStandings,
  type ProgressMap,
  type RaceParticipant,
  type RaceStanding,
  tickRace,
} from '../lib/race-engine'

// ─── 상수 ────────────────────────────────────────────────────────────────────
const MIN_PARTICIPANTS = 2
const MAX_PARTICIPANTS = 14
const DEFAULT_PARTICIPANTS = 8
const COUNTDOWN_STEPS = [3, 2, 1, 'GO'] as const
const LAUNCH_BOOST_DURATION_MS = 360
const START_KICK_RESET_MS = 150
const GO_FLASH_DURATION_MS = 120
const LEADER_CHANGE_HIGHLIGHT_MS = 900

// ─── 타입 ────────────────────────────────────────────────────────────────────
type RaceStatus = 'idle' | 'countdown' | 'running' | 'finished'
type HudStatus = '대기 중' | '출발 준비' | '진행 중' | '완료'
type AnimalPreset = { key: string; name: string }

// ─── 데이터 ──────────────────────────────────────────────────────────────────
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

const RANK_COLORS = [
  {
    glow: 'rgba(250,204,21,0.7)',
    border: '#facc15',
    text: 'text-yellow-300',
    bg: 'bg-yellow-400/15',
  },
  {
    glow: 'rgba(148,163,184,0.6)',
    border: '#94a3b8',
    text: 'text-slate-300',
    bg: 'bg-slate-400/10',
  },
  {
    glow: 'rgba(251,146,60,0.6)',
    border: '#fb923c',
    text: 'text-orange-300',
    bg: 'bg-orange-400/10',
  },
]

// ─── 유틸 ────────────────────────────────────────────────────────────────────
function shuffleAnimals(list: AnimalPreset[]): AnimalPreset[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function makeParticipants(count: number): RaceParticipant[] {
  return shuffleAnimals(ANIMAL_PRESETS)
    .slice(0, count)
    .map((animal, index) => {
      const hasBurst = Math.random() < 0.72
      const burstStart = 42 + Math.random() * 24
      return {
        id: `${animal.key}-${index + 1}`,
        name: animal.name,
        animalKey: animal.key,
        seedOrder: index,
        tieBreaker: Math.random(),
        baseSpeed: 0.16 + Math.random() * 0.11,
        burstStart,
        burstEnd: hasBurst ? burstStart + 5 + Math.random() * 3 : burstStart,
        burstBoost: hasBurst ? 0.06 + Math.random() * 0.09 : 0,
        sprintVolatility: 0.04 + Math.random() * 0.08,
      }
    })
}

function rerollParticipants(participants: RaceParticipant[]): RaceParticipant[] {
  return participants.map(participant => {
    const hasBurst = Math.random() < 0.72
    const burstStart = 42 + Math.random() * 24
    return {
      ...participant,
      tieBreaker: Math.random(),
      baseSpeed: 0.16 + Math.random() * 0.11,
      burstStart,
      burstEnd: hasBurst ? burstStart + 5 + Math.random() * 3 : burstStart,
      burstBoost: hasBurst ? 0.06 + Math.random() * 0.09 : 0,
      sprintVolatility: 0.04 + Math.random() * 0.08,
    }
  })
}

function makeStableParticipants(count: number): RaceParticipant[] {
  return ANIMAL_PRESETS.slice(0, count).map((animal, index) => ({
    id: `${animal.key}-${index + 1}`,
    name: animal.name,
    animalKey: animal.key,
    seedOrder: index,
    tieBreaker: index / 100,
    baseSpeed: 0.2,
    burstStart: 52,
    burstEnd: 58,
    burstBoost: 0.04,
    sprintVolatility: 0.05,
  }))
}

function makeInitialProgressMap(participants: RaceParticipant[]): ProgressMap {
  return Object.fromEntries(participants.map(p => [p.id, 0]))
}

function mapHudStatus(status: RaceStatus): HudStatus {
  const map: Record<RaceStatus, HudStatus> = {
    idle: '대기 중',
    countdown: '출발 준비',
    running: '진행 중',
    finished: '완료',
  }
  return map[status]
}

// ─── 커스텀 훅 ───────────────────────────────────────────────────────────────
function useAutoReset(value: boolean, delay: number, setValue: (v: boolean) => void) {
  useEffect(() => {
    if (!value) return
    const id = window.setTimeout(() => setValue(false), delay)
    return () => window.clearTimeout(id)
  }, [value, delay, setValue])
}

// ─── Controls ────────────────────────────────────────────────────────────────
type ControlsProps = {
  participantCount: number
  status: RaceStatus
  onChangeCount: (next: number) => void
  onStart: () => void
  onReset: () => void
}

function Controls({ participantCount, status, onChangeCount, onStart, onReset }: ControlsProps) {
  const disabled = status === 'countdown' || status === 'running'

  return (
    <div
      className='relative w-full overflow-hidden rounded-2xl'
      style={{
        background: 'linear-gradient(180deg, rgba(10,16,30,0.98) 0%, rgba(7,12,24,0.99) 100%)',
        border: '1px solid rgba(34,211,238,0.15)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* 상단 네온 라인 */}
      <div
        className='absolute inset-x-0 top-0 h-[2px]'
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.7), transparent)',
        }}
      />

      <div className='flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4'>
        {/* 타이틀 */}
        <div className='flex shrink-0 items-center gap-2'>
          <span className='text-lg'>🏁</span>
          <h1
            className='text-base font-black tracking-tight text-white'
            style={{ textShadow: '0 0 16px rgba(34,211,238,0.5)' }}
          >
            동물 레이스
          </h1>
        </div>

        {/* 세로 구분선 */}
        <div
          className='hidden h-7 w-px shrink-0 sm:block'
          style={{ background: 'rgba(255,255,255,0.08)' }}
        />

        {/* 참가자 수 선택 */}
        <div className='flex shrink-0 items-center gap-3'>
          <span className='text-[11px] font-semibold uppercase tracking-widest text-zinc-500'>
            참가자
          </span>
          <div className='relative'>
            <select
              disabled={disabled}
              value={participantCount}
              onChange={e => onChangeCount(Number(e.target.value))}
              className='appearance-none rounded-lg py-1.5 pl-3 pr-8 text-sm font-bold text-cyan-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              style={{
                background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.22)',
              }}
            >
              {Array.from(
                { length: MAX_PARTICIPANTS - MIN_PARTICIPANTS + 1 },
                (_, i) => i + MIN_PARTICIPANTS
              ).map(value => (
                <option
                  key={value}
                  value={value}
                  style={{ background: '#0a1020', color: '#67e8f9' }}
                >
                  {value}명
                </option>
              ))}
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-2.5 flex items-center'>
              <svg className='h-3.5 w-3.5 text-cyan-500/50' viewBox='0 0 16 16' fill='none'>
                <path
                  d='M4 6l4 4 4-4'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
          </div>

          {/* 참가자 수 도트 인디케이터 */}
          <div className='flex items-center gap-[3px]'>
            {Array.from({ length: MAX_PARTICIPANTS }, (_, i) => (
              <div
                key={i}
                className='h-1.5 w-1.5 rounded-full transition-all duration-200'
                style={{
                  background:
                    i < participantCount ? 'rgba(34,211,238,0.7)' : 'rgba(255,255,255,0.07)',
                  boxShadow: i < participantCount ? '0 0 4px rgba(34,211,238,0.5)' : 'none',
                  transform: i < participantCount ? 'scale(1)' : 'scale(0.75)',
                }}
              />
            ))}
          </div>
        </div>

        {/* 세로 구분선 */}
        <div
          className='hidden h-7 w-px shrink-0 sm:block'
          style={{ background: 'rgba(255,255,255,0.08)' }}
        />

        {/* 버튼 그룹 - 오른쪽 끝 정렬 */}
        <div className='ml-auto flex shrink-0 items-center gap-2'>
          <button
            onClick={onReset}
            className='flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium text-zinc-500 transition-all duration-150 hover:text-zinc-300 active:scale-95'
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <RotateCcw className='h-3.5 w-3.5' />
            초기화
          </button>

          <button
            onClick={onStart}
            disabled={disabled}
            className='group relative flex items-center gap-1.5 overflow-hidden rounded-lg px-5 py-2 text-sm font-bold text-white transition-all duration-150 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100'
            style={{
              background:
                'linear-gradient(135deg, rgba(34,211,238,0.22) 0%, rgba(6,182,212,0.32) 100%)',
              border: '1px solid rgba(34,211,238,0.4)',
              boxShadow: disabled
                ? 'none'
                : '0 0 16px rgba(34,211,238,0.18), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <div
              className='absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100'
              style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.1), transparent)' }}
            />
            <Zap className='relative h-3.5 w-3.5' />
            <span className='relative'>시작</span>
          </button>
        </div>
      </div>

      {/* 하단 장식선 */}
      <div
        className='absolute inset-x-0 bottom-0 h-[1px]'
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.15), transparent)',
        }}
      />
    </div>
  )
}

// ─── Track ───────────────────────────────────────────────────────────────────
type TrackProps = {
  status: RaceStatus
  countdownText: string | null
  participants: RaceParticipant[]
  standings: RaceStanding[]
  progressMap: ProgressMap
  leaderPulseToken: number
  leaderChangeFlashId: string | null
  finishPulseTokenMap: Record<string, number>
  startKickToken: number
  trackFlowOffset: number
  trackFlowSpeed: number
  cameraPulseToken: number
  goFlashVisible: boolean
  launchBoostActive: boolean
}

function Track({
  status,
  countdownText,
  participants,
  standings,
  progressMap,
  leaderPulseToken,
  leaderChangeFlashId,
  finishPulseTokenMap,
  startKickToken,
  trackFlowOffset,
  trackFlowSpeed,
  cameraPulseToken,
  goFlashVisible,
  launchBoostActive,
}: TrackProps) {
  const hudStatus = mapHudStatus(status)
  const topThree = standings.slice(0, 3)
  const leader = standings[0]
  const leaderProgress = leader?.progress ?? 0
  const isLateGame = leaderProgress >= 85

  const cameraBaseScale = isLateGame ? 1.025 : 1

  const laneRankById = useMemo(
    () => Object.fromEntries(standings.map((entry, i) => [entry.id, i + 1])),
    [standings]
  )

  const isLateGameOrBoost = isLateGame || launchBoostActive

  return (
    <div
      className='relative flex shrink-0 flex-col overflow-hidden rounded-2xl'
      style={{
        background: 'linear-gradient(180deg, rgba(5,10,20,0.98) 0%, rgba(8,14,26,0.99) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 0 60px rgba(0,0,0,0.7)',
      }}
    >
      {/* 배경 그리드 패턴 */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 상단 글로우 */}
      <div
        className='pointer-events-none absolute inset-x-0 top-0 h-32'
        style={{
          background: isLateGameOrBoost
            ? 'radial-gradient(ellipse at 50% -20%, rgba(251,146,60,0.12), transparent 70%)'
            : 'radial-gradient(ellipse at 50% -20%, rgba(34,211,238,0.08), transparent 70%)',
          transition: 'background 0.6s ease',
        }}
      />

      {/* ── HUD (상단 고정) ── */}
      <div
        className='relative z-20 flex-shrink-0 px-4 py-3'
        style={{
          background: isLateGameOrBoost ? 'rgba(251,100,20,0.08)' : 'rgba(5,10,20,0.9)',
          borderBottom: `1px solid ${isLateGameOrBoost ? 'rgba(251,146,60,0.3)' : 'rgba(34,211,238,0.12)'}`,
          backdropFilter: 'blur(12px)',
          transition: 'all 0.4s ease',
        }}
      >
        <div className='flex items-center gap-3'>
          {/* 왼쪽: 선두 */}
          <div className='flex min-w-0 flex-1 items-center gap-2'>
            {leader && (
              <motion.div
                animate={leaderPulseToken > 0 ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className='flex min-w-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5'
                style={{
                  background: 'rgba(250,204,21,0.08)',
                  border: '1px solid rgba(250,204,21,0.2)',
                  flexShrink: 0,
                }}
              >
                <span className='text-xs'>👑</span>
                <span className='truncate text-[11px] font-bold text-yellow-300'>
                  {leader.name}
                </span>
              </motion.div>
            )}
            {/* 상태 뱃지 */}
            <div
              className='flex items-center gap-1 rounded-md px-2 py-1'
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                className='h-1.5 w-1.5 rounded-full'
                style={{
                  background:
                    status === 'running'
                      ? '#22d3ee'
                      : status === 'finished'
                        ? '#4ade80'
                        : '#6b7280',
                  boxShadow: status === 'running' ? '0 0 6px rgba(34,211,238,0.8)' : 'none',
                  animation: status === 'running' ? 'pulse 1.5s infinite' : 'none',
                }}
              />
              <span className='text-[10px] font-medium text-zinc-400'>{hudStatus}</span>
            </div>
          </div>

          {/* 오른쪽: 상위 3위 */}
          <div className='flex items-center gap-1.5'>
            {topThree.map((entry, i) => {
              const rankColor = RANK_COLORS[i]
              return (
                <motion.div
                  key={entry.id}
                  animate={i === 0 && leaderPulseToken > 0 ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'hidden items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold sm:flex',
                    rankColor.text,
                    rankColor.bg
                  )}
                  style={{
                    border: `1px solid ${rankColor.border}25`,
                    boxShadow: i === 0 ? `0 0 6px ${rankColor.glow}` : 'none',
                  }}
                >
                  <span>{i + 1}</span>
                  <span className='max-w-[48px] truncate'>{entry.name}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── 레인 영역 ── */}
      <motion.div
        animate={
          cameraPulseToken > 0
            ? { scale: [cameraBaseScale, cameraBaseScale * 1.006, cameraBaseScale] }
            : { scale: cameraBaseScale }
        }
        transition={{ duration: 0.18 }}
        className='relative p-4 sm:p-5'
      >
        <div className='flex flex-col gap-2'>
          {participants.map(participant => {
            const progress = progressMap[participant.id] ?? 0
            const finishPulseToken = finishPulseTokenMap[participant.id] ?? 0
            const isLeaderLane = participant.id === leader?.id
            const isNewLeader = participant.id === leaderChangeFlashId
            const laneRank = laneRankById[participant.id] ?? 99
            const isTopThreeLane = laneRank <= 3
            const rankColor = isTopThreeLane ? RANK_COLORS[laneRank - 1] : null

            const runnerAnimate =
              finishPulseToken > 0
                ? { scale: [1, 1.16, 1], x: [0, 10, 0], y: 0 }
                : startKickToken > 0
                  ? { scale: [1, 1.06, 1], x: [0, 12, 0], y: [0, -3, 0] }
                  : isLeaderLane && leaderPulseToken > 0
                    ? { scale: [1, 1.09, 1], x: 0, y: 0 }
                    : { scale: 1, x: 0, y: 0 }

            const runnerDuration = finishPulseToken > 0 ? 0.38 : startKickToken > 0 ? 0.15 : 0.4

            const laneGlow = isNewLeader
              ? '0 0 24px rgba(34,211,238,0.4), inset 0 1px 0 rgba(34,211,238,0.15)'
              : isLeaderLane
                ? '0 0 16px rgba(250,204,21,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
                : isTopThreeLane
                  ? `0 0 8px ${rankColor?.glow ?? 'transparent'}15, inset 0 1px 0 rgba(255,255,255,0.03)`
                  : 'inset 0 1px 0 rgba(255,255,255,0.03)'

            const laneBorderColor = isNewLeader
              ? 'rgba(34,211,238,0.6)'
              : isLeaderLane
                ? 'rgba(250,204,21,0.2)'
                : isTopThreeLane
                  ? `${rankColor?.border ?? '#fff'}14`
                  : 'rgba(255,255,255,0.05)'

            const laneBg = isNewLeader
              ? 'linear-gradient(90deg, rgba(34,211,238,0.1) 0%, rgba(15,20,30,0.95) 60%)'
              : isLeaderLane
                ? 'linear-gradient(90deg, rgba(250,204,21,0.05) 0%, rgba(15,20,30,0.95) 60%)'
                : 'linear-gradient(90deg, rgba(18,24,38,0.95) 0%, rgba(12,16,26,0.98) 100%)'

            return (
              <div
                key={participant.id}
                className='relative overflow-hidden rounded-xl transition-all duration-200'
                style={{
                  background: laneBg,
                  border: `1px solid ${laneBorderColor}`,
                  boxShadow: laneGlow,
                }}
              >
                {/* 새 선두 사이언 플래시 */}
                <motion.div
                  animate={isNewLeader ? { opacity: [0, 0.5, 0] } : { opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className='pointer-events-none absolute inset-0 z-10'
                  style={{
                    background:
                      'radial-gradient(ellipse at 20% 50%, rgba(34,211,238,0.25), transparent 60%)',
                  }}
                />

                {/* 선두 레인 골드 플래시 */}
                <motion.div
                  animate={
                    isLeaderLane && leaderPulseToken > 0 ? { opacity: [0, 0.5, 0] } : { opacity: 0 }
                  }
                  transition={{ duration: 0.4 }}
                  className='pointer-events-none absolute inset-0 z-10'
                  style={{
                    background:
                      'radial-gradient(ellipse at 30% 50%, rgba(250,204,21,0.25), transparent 60%)',
                  }}
                />

                {/* 메인 레인 콘텐츠 */}
                <div className='relative flex h-full items-center gap-3 px-4 py-3'>
                  {/* 레일 번호 */}
                  <div
                    className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold text-zinc-500'
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    {participant.seedOrder + 1}
                  </div>

                  {/* 트랙 (점선 + 동물 + 결승선) */}
                  <div className='relative flex-1 overflow-visible' style={{ height: 48 }}>
                    {/* 점선 트랙 */}
                    <div
                      className='absolute inset-y-0 left-0 right-0 my-auto'
                      style={{
                        height: 1,
                        top: '50%',
                        backgroundImage:
                          'linear-gradient(90deg, rgba(255,255,255,0.08) 50%, transparent 50%)',
                        backgroundSize: '8px 1px',
                        backgroundRepeat: 'repeat-x',
                      }}
                    />

                    {/* 결승선 체크무늬 */}
                    <div
                      className='absolute inset-y-0 right-0 w-3'
                      style={{
                        backgroundImage: `
                          linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%),
                          linear-gradient(-45deg, rgba(255,255,255,0.15) 25%, transparent 25%),
                          linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.15) 75%),
                          linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.15) 75%)
                        `,
                        backgroundSize: '4px 4px',
                        backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
                      }}
                    />
                    {/* 결승선 글로우 */}
                    {status === 'finished' && laneRank === 1 && (
                      <div
                        className='absolute inset-y-0 right-0 w-8'
                        style={{
                          background:
                            'radial-gradient(ellipse at right, rgba(250,204,21,0.3), transparent 70%)',
                        }}
                      />
                    )}

                    {/* 동물 */}
                    <motion.div
                      animate={runnerAnimate}
                      transition={{ duration: runnerDuration, ease: 'easeOut' }}
                      className='absolute top-1/2 -translate-y-1/2'
                      style={{
                        left: `${Math.min(progress, 93)}%`,
                        transform: `translateX(-50%) translateY(-50%)`,
                        zIndex: 5,
                      }}
                    >
                      <div className='relative'>
                        <Image
                          src={`/animals/${participant.animalKey}.png`}
                          alt={participant.name}
                          width={40}
                          height={40}
                          className='object-contain'
                          style={{
                            filter: isLeaderLane
                              ? 'drop-shadow(0 0 6px rgba(250,204,21,0.7))'
                              : isNewLeader
                                ? 'drop-shadow(0 0 6px rgba(34,211,238,0.8))'
                                : 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
                          }}
                        />
                        {/* 속도감 잔상 */}
                        {status === 'running' && (
                          <div
                            className='pointer-events-none absolute inset-y-0 right-full w-6 opacity-30'
                            style={{
                              background:
                                'linear-gradient(90deg, transparent, rgba(34,211,238,0.4))',
                            }}
                          />
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* 오른쪽 정보 */}
                  <div className='flex w-20 shrink-0 flex-col items-end gap-1'>
                    {/* 이름 */}
                    <span className='truncate text-xs font-medium text-zinc-400'>
                      {participant.name}
                    </span>

                    {/* 완료 후 순위 OR 진행률 */}
                    {status === 'finished' ? (
                      <span
                        className={cn(
                          'text-sm font-bold',
                          laneRank === 1
                            ? 'text-yellow-300'
                            : laneRank === 2
                              ? 'text-slate-300'
                              : laneRank === 3
                                ? 'text-orange-300'
                                : 'text-zinc-500'
                        )}
                      >
                        {laneRank}위
                      </span>
                    ) : (
                      <span
                        className='text-xs font-semibold tabular-nums'
                        style={{
                          color: progress > 90 ? '#fbbf24' : progress > 50 ? '#67e8f9' : '#6b7280',
                        }}
                      >
                        {progress.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* 하단 진행바 */}
                <div
                  className='absolute bottom-0 left-0 h-[2px] transition-all'
                  style={{
                    width: `${progress}%`,
                    background: isLeaderLane
                      ? 'linear-gradient(90deg, rgba(250,204,21,0.4), rgba(250,204,21,0.8))'
                      : isNewLeader
                        ? 'linear-gradient(90deg, rgba(34,211,238,0.4), rgba(34,211,238,0.9))'
                        : isTopThreeLane
                          ? `linear-gradient(90deg, ${rankColor?.border ?? '#fff'}40, ${rankColor?.border ?? '#fff'}80)`
                          : 'linear-gradient(90deg, rgba(100,116,139,0.3), rgba(100,116,139,0.6))',
                    boxShadow: isLeaderLane
                      ? '0 0 6px rgba(250,204,21,0.5)'
                      : isNewLeader
                        ? '0 0 6px rgba(34,211,238,0.6)'
                        : 'none',
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── 카운트다운 오버레이 ── */}
      <AnimatePresence>
        {countdownText && (
          <motion.div
            key={countdownText}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.3 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className='absolute inset-0 z-30 flex items-center justify-center'
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          >
            {/* 외부 링 */}
            {countdownText !== 'GO' && (
              <div
                className='absolute h-40 w-40 rounded-full'
                style={{
                  border: '2px solid rgba(34,211,238,0.3)',
                  boxShadow: '0 0 40px rgba(34,211,238,0.2)',
                  animation: 'ping 0.7s ease-out',
                }}
              />
            )}
            <div
              className='relative flex items-center justify-center'
              style={{
                fontSize: countdownText === 'GO' ? 72 : 96,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: countdownText === 'GO' ? '#4ade80' : '#ffffff',
                textShadow:
                  countdownText === 'GO'
                    ? '0 0 40px rgba(74,222,128,0.8), 0 0 80px rgba(74,222,128,0.4)'
                    : '0 0 40px rgba(34,211,238,0.5)',
              }}
            >
              {countdownText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GO 플래시 ── */}
      <AnimatePresence>
        {goFlashVisible && (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className='pointer-events-none absolute inset-0 z-20'
            style={{ background: 'rgba(74,222,128,0.15)' }}
          />
        )}
      </AnimatePresence>

      {/* 하단 글로우 라인 */}
      <div
        className='pointer-events-none absolute inset-x-0 bottom-0 h-[1px]'
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.2), transparent)',
        }}
      />
    </div>
  )
}

// ─── Result ──────────────────────────────────────────────────────────────────
type ResultProps = {
  standings: RaceStanding[]
  onRestart: () => void
  onReset: () => void
}

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉']

function Result({ standings, onRestart, onReset }: ResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className='relative overflow-hidden rounded-2xl'
      style={{
        background: 'linear-gradient(160deg, rgba(10,16,30,0.99) 0%, rgba(6,10,20,0.99) 100%)',
        border: '1px solid rgba(250,204,21,0.18)',
        boxShadow: '0 0 40px rgba(0,0,0,0.6), 0 0 20px rgba(250,204,21,0.04)',
      }}
    >
      {/* 상단 골드 라인 */}
      <div
        className='absolute inset-x-0 top-0 h-[2px]'
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.8), transparent)',
        }}
      />
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'radial-gradient(ellipse at 50% -20%, rgba(250,204,21,0.05), transparent 55%)',
        }}
      />

      <div className='relative p-5'>
        {/* 헤더 */}
        <div className='mb-4 flex items-center justify-between'>
          <h2
            className='text-base font-black tracking-tight text-white'
            style={{ textShadow: '0 0 16px rgba(250,204,21,0.35)' }}
          >
            🏁 경기 결과
          </h2>
          <div className='flex gap-2'>
            <button
              onClick={onReset}
              className='flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-all hover:text-zinc-300 active:scale-95'
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <RotateCcw className='h-3 w-3' />
              초기화
            </button>
            <button
              onClick={onRestart}
              className='flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95'
              style={{
                background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(6,182,212,0.3))',
                border: '1px solid rgba(34,211,238,0.35)',
                boxShadow: '0 0 12px rgba(34,211,238,0.12)',
              }}
            >
              <Zap className='h-3 w-3' />
              다시 하기
            </button>
          </div>
        </div>

        {/* 전체 순위 — 가로 스크롤 없는 그리드 */}
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7'>
          {standings.map((entry, i) => {
            const rankColor = i < 3 ? RANK_COLORS[i] : null
            const isFirst = i === 0
            const isPodium = i < 3

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className={cn(
                  'relative flex flex-col items-center gap-1.5 rounded-xl p-3',
                  rankColor?.bg ?? 'bg-white/[0.02]'
                )}
                style={{
                  border: `1px solid ${isPodium ? (rankColor?.border ?? '#fff') + '28' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isFirst ? `0 0 16px ${rankColor!.glow}` : 'none',
                }}
              >
                {/* 1위 왕관 */}
                {isFirst && (
                  <div className='absolute -top-3 left-1/2 -translate-x-1/2 text-sm'>👑</div>
                )}

                {/* 순위 배지 */}
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black',
                    isPodium ? rankColor!.text : 'text-zinc-600'
                  )}
                  style={{
                    background: isPodium ? `${rankColor!.border}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isPodium ? rankColor!.border + '30' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  {i + 1}
                </div>

                {/* 동물 이미지 */}
                <Image
                  src={`/animals/${entry.animalKey ?? entry.id.split('-')[0]}.png`}
                  alt={entry.name}
                  width={isFirst ? 48 : 36}
                  height={isFirst ? 48 : 36}
                  className='object-contain'
                  style={{
                    filter: isPodium
                      ? `drop-shadow(0 0 ${isFirst ? 7 : 4}px ${rankColor!.glow})`
                      : 'drop-shadow(0 0 2px rgba(0,0,0,0.4))',
                    marginTop: isFirst ? 2 : 0,
                  }}
                />

                {/* 이름 */}
                <span
                  className={cn(
                    'text-center text-[11px] font-bold leading-tight',
                    isPodium ? rankColor!.text : 'text-zinc-500'
                  )}
                >
                  {entry.name}
                </span>

                {/* 메달 */}
                {isPodium && <span className='text-xs'>{MEDAL_EMOJIS[i]}</span>}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div
        className='absolute inset-x-0 bottom-0 h-[1px]'
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.25), transparent)',
        }}
      />
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnimalRacePage() {
  const initialParticipantsRef = useRef<RaceParticipant[]>(
    makeStableParticipants(DEFAULT_PARTICIPANTS)
  )

  const [participantCount, setParticipantCount] = useState(DEFAULT_PARTICIPANTS)
  const [participants, setParticipants] = useState<RaceParticipant[]>(
    initialParticipantsRef.current
  )
  const [progressMap, setProgressMap] = useState<ProgressMap>(() =>
    makeInitialProgressMap(initialParticipantsRef.current)
  )
  const [status, setStatus] = useState<RaceStatus>('idle')
  const [countdownText, setCountdownText] = useState<string | null>(null)
  const [startKickToken, setStartKickToken] = useState(0)
  const [leaderPulseToken, setLeaderPulseToken] = useState(0)
  const [leaderChangeFlashId, setLeaderChangeFlashId] = useState<string | null>(null)
  const [finishPulseTokenMap, setFinishPulseTokenMap] = useState<Record<string, number>>({})
  const [trackFlowOffset, setTrackFlowOffset] = useState(0)
  const [trackFlowSpeed, setTrackFlowSpeed] = useState(0)
  const [launchBoostActive, setLaunchBoostActive] = useState(false)
  const [goFlashVisible, setGoFlashVisible] = useState(false)
  const [cameraPulseToken, setCameraPulseToken] = useState(0)

  const rafRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const timersRef = useRef<number[]>([])
  const leaderFlashTimerRef = useRef<number | null>(null)
  const previousLeaderRef = useRef<string | null>(null)
  const participantsRef = useRef(participants)
  const launchBoostRef = useRef(launchBoostActive)
  const progressMapRef = useRef<ProgressMap>(makeInitialProgressMap(initialParticipantsRef.current))

  useEffect(() => {
    participantsRef.current = participants
  }, [participants])
  useEffect(() => {
    launchBoostRef.current = launchBoostActive
  }, [launchBoostActive])

  const standings = useMemo(
    () => computeStandings(participants, progressMap),
    [participants, progressMap]
  )

  useAutoReset(goFlashVisible, GO_FLASH_DURATION_MS, setGoFlashVisible)
  useAutoReset(launchBoostActive, LAUNCH_BOOST_DURATION_MS, setLaunchBoostActive)

  useEffect(() => {
    if (startKickToken === 0) return
    const id = window.setTimeout(() => setStartKickToken(0), START_KICK_RESET_MS)
    return () => window.clearTimeout(id)
  }, [startKickToken])

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id)
    timersRef.current = []
  }, [])

  const clearLeaderFlashTimer = useCallback(() => {
    if (leaderFlashTimerRef.current !== null) {
      window.clearTimeout(leaderFlashTimerRef.current)
      leaderFlashTimerRef.current = null
    }
  }, [])

  const stopRaceLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastFrameRef.current = null
  }, [])

  const setupRace = useCallback(
    (count: number) => {
      const nextParticipants = makeParticipants(count)
      setParticipants(nextParticipants)
      setProgressMap(makeInitialProgressMap(nextParticipants))
      setFinishPulseTokenMap({})
      setTrackFlowOffset(0)
      setTrackFlowSpeed(0)
      setLaunchBoostActive(false)
      setGoFlashVisible(false)
      setCameraPulseToken(0)
      clearLeaderFlashTimer()
      setLeaderChangeFlashId(null)
      previousLeaderRef.current = null
    },
    [clearLeaderFlashTimer]
  )

  const resetRaceState = useCallback(
    (nextParticipants?: RaceParticipant[]) => {
      const currentParticipants = nextParticipants ?? participantsRef.current
      if (nextParticipants) {
        participantsRef.current = nextParticipants
        setParticipants(nextParticipants)
      }
      const initialMap = makeInitialProgressMap(currentParticipants)
      progressMapRef.current = initialMap
      setProgressMap(initialMap)
      setFinishPulseTokenMap({})
      setTrackFlowOffset(0)
      setTrackFlowSpeed(0)
      setLaunchBoostActive(false)
      setGoFlashVisible(false)
      setCameraPulseToken(0)
      setCountdownText(null)
      setStartKickToken(0)
      setLeaderPulseToken(0)
      clearLeaderFlashTimer()
      setLeaderChangeFlashId(null)
      previousLeaderRef.current = null
    },
    [clearLeaderFlashTimer]
  )

  const onReset = useCallback(() => {
    clearTimers()
    stopRaceLoop()
    resetRaceState()
    setStatus('idle')
  }, [clearTimers, stopRaceLoop, resetRaceState])

  const onStart = useCallback(() => {
    if (status === 'running' || status === 'countdown') return
    clearTimers()
    stopRaceLoop()
    const refreshedParticipants = rerollParticipants(participantsRef.current)
    resetRaceState(refreshedParticipants)
    setStatus('countdown')

    COUNTDOWN_STEPS.forEach((step, i) => {
      const id = window.setTimeout(() => {
        setCountdownText(String(step))
        if (step === 'GO') {
          setStartKickToken(prev => prev + 1)
          setGoFlashVisible(true)
          setLaunchBoostActive(true)
        }
      }, i * 700)
      timersRef.current.push(id)
    })

    const startId = window.setTimeout(
      () => {
        setCountdownText(null)
        setStatus('running')
      },
      COUNTDOWN_STEPS.length * 700 + 120
    )
    timersRef.current.push(startId)
  }, [status, clearTimers, stopRaceLoop, resetRaceState])

  useEffect(() => {
    const randomized = makeParticipants(DEFAULT_PARTICIPANTS)
    participantsRef.current = randomized
    setParticipants(randomized)
    setProgressMap(makeInitialProgressMap(randomized))
  }, [])

  useEffect(() => {
    if (status !== 'running') return

    const tick = (timestamp: number) => {
      const last = lastFrameRef.current
      const deltaMs = last !== null ? timestamp - last : 16.7
      lastFrameRef.current = timestamp

      const currentParticipants = participantsRef.current
      let completed = false
      let finishIds: string[] = []
      let nextLeaderProgress = 0
      let frameAverageProgress = 0

      // progressMap을 ref로 직접 관리해 RAF 콜백 내 완료 감지 신뢰도 향상
      const prevMap = progressMapRef.current
      const { nextProgressMap, finishedIds, allFinished } = tickRace({
        participants: currentParticipants,
        prevProgressMap: prevMap,
        deltaMs,
      })
      progressMapRef.current = nextProgressMap
      finishIds = finishedIds
      completed = allFinished

      let sum = 0
      let leaderMax = 0
      for (const p of currentParticipants) {
        const cur = nextProgressMap[p.id] ?? 0
        sum += cur
        if (cur > leaderMax) leaderMax = cur
      }
      frameAverageProgress = currentParticipants.length ? sum / currentParticipants.length : 0
      nextLeaderProgress = leaderMax

      setProgressMap(nextProgressMap)

      if (finishIds.length > 0) {
        setFinishPulseTokenMap(prev => {
          const next = { ...prev }
          for (const id of finishIds) next[id] = (next[id] ?? 0) + 1
          return next
        })
      }

      const speedBase = 0.24 + frameAverageProgress * 0.0115
      const lateGameBoost = nextLeaderProgress >= 85 ? 1.3 : 1
      const launchMult = launchBoostRef.current ? 2.2 : 1
      const flowSpeed = speedBase * lateGameBoost * launchMult

      setTrackFlowSpeed(flowSpeed)
      setTrackFlowOffset(prev => (prev + flowSpeed * (deltaMs / 16.7)) % 1200)

      if (completed) {
        setStatus('finished')
        setTrackFlowSpeed(0)
        setLaunchBoostActive(false)
        stopRaceLoop()
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return stopRaceLoop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    if (status !== 'running') {
      previousLeaderRef.current = null
      return
    }

    const leaderId = standings[0]?.id ?? null
    if (!leaderId) return

    if (previousLeaderRef.current !== null && previousLeaderRef.current !== leaderId) {
      setLeaderPulseToken(prev => prev + 1)
      setCameraPulseToken(prev => prev + 1)
      clearLeaderFlashTimer()
      setLeaderChangeFlashId(leaderId)
      leaderFlashTimerRef.current = window.setTimeout(() => {
        setLeaderChangeFlashId(null)
        leaderFlashTimerRef.current = null
      }, LEADER_CHANGE_HIGHLIGHT_MS)
    }

    previousLeaderRef.current = leaderId
  }, [standings, status, clearLeaderFlashTimer])

  useEffect(() => {
    return () => {
      clearTimers()
      clearLeaderFlashTimer()
      stopRaceLoop()
    }
  }, [clearTimers, clearLeaderFlashTimer, stopRaceLoop])

  return (
    <div
      className='flex h-screen w-full flex-col overflow-hidden p-3 sm:p-4'
      style={{ background: 'linear-gradient(135deg, #020408 0%, #030610 50%, #020408 100%)' }}
    >
      {/* 배경 앰비언트 */}
      <div
        className='pointer-events-none fixed inset-0'
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.04), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.02), transparent 50%)',
        }}
      />

      <div
        className='relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto'
        style={{ scrollbarWidth: 'none' }}
      >
        {/* 상단: Controls 바 */}
        <div className='w-full'>
          <Controls
            participantCount={participantCount}
            status={status}
            onChangeCount={value => {
              setParticipantCount(value)
              if (status === 'idle' || status === 'finished') {
                setupRace(value)
                setStatus('idle')
              }
            }}
            onStart={onStart}
            onReset={onReset}
          />
        </div>

        {/* 레이스 트랙 — 레인 수에 따라 높이 자동 */}
        <Track
          status={status}
          countdownText={countdownText}
          participants={participants}
          standings={standings}
          progressMap={progressMap}
          leaderPulseToken={leaderPulseToken}
          leaderChangeFlashId={leaderChangeFlashId}
          finishPulseTokenMap={finishPulseTokenMap}
          startKickToken={startKickToken}
          trackFlowOffset={trackFlowOffset}
          trackFlowSpeed={trackFlowSpeed}
          cameraPulseToken={cameraPulseToken}
          goFlashVisible={goFlashVisible}
          launchBoostActive={launchBoostActive}
        />

        {/* 경기 결과 — 완료 시 트랙 하단에 인라인 표시 */}
        <AnimatePresence>
          {status === 'finished' && (
            <Result standings={standings} onRestart={onStart} onReset={onReset} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
