'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Flag, RotateCcw, Trophy } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/client'

import {
  computeStandings,
  tickRace,
  type ProgressMap,
  type RaceParticipant,
  type RaceStanding,
} from '../lib/race-engine'

type RaceStatus = 'idle' | 'countdown' | 'running' | 'finished'

type AnimalPreset = {
  key: string
  name: string
}

const MIN_PARTICIPANTS = 2
const MAX_PARTICIPANTS = 14
const COUNTDOWN_STEPS = [3, 2, 1, 'GO'] as const
const DEFAULT_PARTICIPANTS = 8

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

function shuffleAnimals(list: AnimalPreset[]) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }
  return copy
}

function makeParticipants(count: number): RaceParticipant[] {
  return shuffleAnimals(ANIMAL_PRESETS)
    .slice(0, count)
    .map((animal, index) => ({
      id: `${animal.key}-${index + 1}`,
      name: animal.name,
      animalKey: animal.key,
      seedOrder: index,
      baseSpeed: 0.16 + Math.random() * 0.1,
    }))
}

function makeInitialProgressMap(participants: RaceParticipant[]): ProgressMap {
  return participants.reduce<ProgressMap>((acc, participant) => {
    acc[participant.id] = 0
    return acc
  }, {})
}

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
    <div className='flex w-full flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3 shadow-sm backdrop-blur sm:p-4'>
      <label className='text-sm text-muted-foreground'>참가자 수</label>
      <select
        value={participantCount}
        disabled={disabled}
        onChange={e => onChangeCount(Number(e.target.value))}
        className='h-10 min-w-24 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60'
      >
        {Array.from(
          { length: MAX_PARTICIPANTS - MIN_PARTICIPANTS + 1 },
          (_, index) => index + MIN_PARTICIPANTS
        ).map(value => (
          <option key={value} value={value}>
            {value}명
          </option>
        ))}
      </select>

      <Button className='ml-auto' onClick={onStart} disabled={disabled}>
        <Flag className='mr-1 h-4 w-4' />
        Start
      </Button>
      <Button variant='secondary' onClick={onReset}>
        <RotateCcw className='mr-1 h-4 w-4' />
        Reset
      </Button>
    </div>
  )
}

type TrackProps = {
  status: RaceStatus
  countdownText: string | null
  participants: RaceParticipant[]
  standings: RaceStanding[]
  progressMap: ProgressMap
  leaderPulseToken: number
  finishPulseTokenMap: Record<string, number>
  startKickToken: number
}

function Track({
  status,
  countdownText,
  participants,
  standings,
  progressMap,
  leaderPulseToken,
  finishPulseTokenMap,
  startKickToken,
}: TrackProps) {
  const topThree = standings.slice(0, 3)

  return (
    <div className='relative w-full overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-zinc-900/95 to-zinc-950 p-3 shadow-xl sm:p-4'>
      <div className='pointer-events-none absolute left-0 right-0 top-0 h-20 bg-gradient-to-b from-white/5 to-transparent' />

      <div className='absolute left-3 top-3 z-30 rounded-xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur sm:left-4 sm:top-4'>
        <div className='mb-1 text-[10px] uppercase tracking-wider text-zinc-300'>Live Top 3</div>
        <div className='space-y-1.5'>
          {topThree.map((entry, index) => {
            const isLeader = index === 0
            return (
              <motion.div
                key={entry.id}
                animate={
                  isLeader && leaderPulseToken > 0
                    ? {
                        scale: [1, 1.05, 1],
                        boxShadow: ['0 0 0 rgba(250,204,21,0)', '0 0 16px rgba(250,204,21,0.55)', '0 0 0 rgba(250,204,21,0)'],
                      }
                    : { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' }
                }
                transition={{ duration: 0.45 }}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-md px-2 py-1 text-xs text-zinc-100',
                  isLeader ? 'bg-yellow-400/20 ring-1 ring-yellow-300/30' : 'bg-white/5'
                )}
              >
                <div className='flex items-center gap-1.5'>
                  {isLeader ? <Trophy className='h-3.5 w-3.5 text-yellow-300' /> : <span>{index + 1}위</span>}
                  <span>{entry.name}</span>
                </div>
                <span className='tabular-nums text-zinc-300'>{entry.progress.toFixed(1)}%</span>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className='relative mt-24 max-h-[58vh] overflow-y-auto rounded-2xl border border-white/5 bg-black/20 p-2 sm:mt-20 sm:p-3'>
        <div className='space-y-2'>
          {participants.map((participant, index) => {
            const progress = progressMap[participant.id] ?? 0
            const finishPulseToken = finishPulseTokenMap[participant.id] ?? 0

            return (
              <div
                key={participant.id}
                className='group relative h-14 overflow-hidden rounded-xl border border-white/10 bg-[#292d34] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:h-16'
              >
                <div className='absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),rgba(0,0,0,0.18))]' />
                <div className='absolute bottom-0 left-1 top-0 w-1 rounded-full bg-zinc-200/40' />
                <div className='absolute bottom-0 right-8 top-0 w-1 rounded-full bg-zinc-200/35 sm:right-9' />
                <div className='absolute left-2 right-12 top-1/2 h-px -translate-y-1/2 bg-[repeating-linear-gradient(to_right,rgba(255,255,255,0.72)_0_10px,transparent_10px_18px)]' />

                {index < participants.length - 1 && (
                  <div className='absolute bottom-0 left-0 right-10 h-[1px] bg-white/20' />
                )}

                <div className='absolute bottom-0 right-0 top-0 z-20 w-10 border-l border-white/20 bg-[linear-gradient(45deg,#111_25%,#f5f5f5_25%,#f5f5f5_50%,#111_50%,#111_75%,#f5f5f5_75%,#f5f5f5_100%)] bg-[length:12px_12px] sm:w-12' />

                <div className='absolute inset-y-0 left-2 right-12'>
                  <motion.div
                    className='absolute top-1/2 -translate-x-1/2 -translate-y-1/2'
                    style={{ left: `${progress}%` }}
                    animate={{
                      scale:
                        status === 'running' && startKickToken > 0
                          ? [1, 1.06, 1]
                          : finishPulseToken > 0
                            ? [1, 1.12, 1]
                            : 1,
                      y: status === 'running' && startKickToken > 0 ? [0, -3, 0] : 0,
                      x: finishPulseToken > 0 ? [0, 5, 0] : 0,
                    }}
                    transition={{ duration: finishPulseToken > 0 ? 0.38 : 0.28, ease: 'easeOut' }}
                  >
                    <div className='relative'>
                      <Image
                        src={`/animals/${participant.animalKey}.png`}
                        alt={participant.name}
                        width={42}
                        height={42}
                        className='h-9 w-9 drop-shadow-md sm:h-10 sm:w-10'
                      />
                    </div>
                  </motion.div>
                </div>

                <div className='absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-zinc-200 sm:text-xs'>
                  {participant.name}
                </div>
                <div className='absolute right-12 top-1/2 z-10 -translate-y-1/2 text-[10px] tabular-nums text-zinc-200 sm:text-xs'>
                  {progress.toFixed(1)}%
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
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 1.08 }}
            transition={{ duration: 0.38 }}
            className='absolute inset-0 z-40 flex items-center justify-center bg-black/45 backdrop-blur-[2px]'
          >
            <div
              className={cn(
                'rounded-2xl border px-7 py-4 text-5xl font-black sm:text-7xl',
                countdownText === 'GO'
                  ? 'border-emerald-300/55 bg-emerald-400/20 text-emerald-200'
                  : 'border-white/30 bg-zinc-900/70 text-white'
              )}
            >
              {countdownText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35 }}
      className='w-full rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm backdrop-blur sm:p-5'
    >
      <div className='mb-4 text-lg font-semibold'>결과 Top 3</div>
      <div className='grid gap-3 sm:grid-cols-3'>
        {topThree.map((entry, index) => (
          <div
            key={entry.id}
            className={cn(
              'rounded-xl border p-3',
              index === 0
                ? 'border-yellow-400/70 bg-yellow-400/15 shadow-[0_0_20px_rgba(250,204,21,0.18)]'
                : 'border-border bg-muted/30'
            )}
          >
            <div className='mb-1 text-xs text-muted-foreground'>{index + 1}위</div>
            <div className='flex items-center gap-2'>
              <Image
                src={`/animals/${entry.animalKey}.png`}
                alt={entry.name}
                width={32}
                height={32}
                className='h-8 w-8'
              />
              <div className='font-semibold'>{entry.name}</div>
            </div>
            <div className='mt-2 text-sm tabular-nums text-muted-foreground'>최종 {entry.progress.toFixed(1)}%</div>
          </div>
        ))}
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        <Button onClick={onRestart}>Restart</Button>
        <Button variant='secondary' onClick={onReset}>
          Reset
        </Button>
      </div>
    </motion.div>
  )
}

export default function AnimalRacePage() {
  const initialParticipantsRef = useRef<RaceParticipant[]>(makeParticipants(DEFAULT_PARTICIPANTS))
  const [participantCount, setParticipantCount] = useState(DEFAULT_PARTICIPANTS)
  const [participants, setParticipants] = useState<RaceParticipant[]>(initialParticipantsRef.current)
  const [progressMap, setProgressMap] = useState<ProgressMap>(() =>
    makeInitialProgressMap(initialParticipantsRef.current)
  )
  const [status, setStatus] = useState<RaceStatus>('idle')
  const [countdownText, setCountdownText] = useState<string | null>(null)
  const [startKickToken, setStartKickToken] = useState(0)
  const [leaderPulseToken, setLeaderPulseToken] = useState(0)
  const [finishPulseTokenMap, setFinishPulseTokenMap] = useState<Record<string, number>>({})

  const rafRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const timersRef = useRef<number[]>([])
  const previousLeaderRef = useRef<string | null>(null)

  const standings = useMemo(() => computeStandings(participants, progressMap), [participants, progressMap])

  const clearTimers = () => {
    for (const timerId of timersRef.current) window.clearTimeout(timerId)
    timersRef.current = []
  }

  const stopRaceLoop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastFrameRef.current = null
  }

  const setupRace = (count: number) => {
    const nextParticipants = makeParticipants(count)
    const nextProgressMap = makeInitialProgressMap(nextParticipants)
    setParticipants(nextParticipants)
    setProgressMap(nextProgressMap)
    setFinishPulseTokenMap({})
    previousLeaderRef.current = null
  }

  const onReset = () => {
    clearTimers()
    stopRaceLoop()
    setStatus('idle')
    setCountdownText(null)
    setStartKickToken(0)
    setLeaderPulseToken(0)
    setupRace(participantCount)
  }

  const onStart = () => {
    if (status === 'running' || status === 'countdown') return

    clearTimers()
    stopRaceLoop()
    setupRace(participantCount)
    setStatus('countdown')

    COUNTDOWN_STEPS.forEach((step, index) => {
      const timerId = window.setTimeout(() => {
        setCountdownText(String(step))
        if (step === 'GO') {
          setStartKickToken(prev => prev + 1)
        }
      }, index * 700)

      timersRef.current.push(timerId)
    })

    const startTimerId = window.setTimeout(
      () => {
        setCountdownText(null)
        setStatus('running')
      },
      COUNTDOWN_STEPS.length * 700 + 120
    )
    timersRef.current.push(startTimerId)
  }

  useEffect(() => {
    return () => {
      clearTimers()
      stopRaceLoop()
    }
  }, [])

  useEffect(() => {
    if (status !== 'running') return

    const tick = (timestamp: number) => {
      const last = lastFrameRef.current
      const deltaMs = last ? timestamp - last : 16.7
      lastFrameRef.current = timestamp

      let completed = false
      let finishIds: string[] = []

      setProgressMap(prevProgressMap => {
        const { nextProgressMap, finishedIds, allFinished } = tickRace({
          participants,
          prevProgressMap,
          deltaMs,
        })

        finishIds = finishedIds
        completed = allFinished
        return nextProgressMap
      })

      if (finishIds.length > 0) {
        setFinishPulseTokenMap(prev => {
          const next = { ...prev }
          for (const id of finishIds) next[id] = (next[id] ?? 0) + 1
          return next
        })
      }

      if (completed) {
        setStatus('finished')
        stopRaceLoop()
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      stopRaceLoop()
    }
  }, [participants, status])

  useEffect(() => {
    if (status !== 'running') {
      previousLeaderRef.current = null
      return
    }

    const leaderId = standings[0]?.id ?? null
    if (!leaderId) return

    if (previousLeaderRef.current && previousLeaderRef.current !== leaderId) {
      setLeaderPulseToken(prev => prev + 1)
    }

    previousLeaderRef.current = leaderId
  }, [standings, status])

  useEffect(() => {
    if (startKickToken === 0) return

    const timerId = window.setTimeout(() => {
      setStartKickToken(0)
    }, 420)

    return () => window.clearTimeout(timerId)
  }, [startKickToken])

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-4 px-2 pb-10 sm:gap-5 sm:px-0'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>Animal Race v2</h1>
        <p className='text-sm text-muted-foreground'>실시간 순위는 진행률 기준으로 자동 계산됩니다.</p>
      </div>

      <Controls
        participantCount={participantCount}
        status={status}
        onChangeCount={value => {
          setParticipantCount(value)
          if (status === 'idle' || status === 'finished') setupRace(value)
        }}
        onStart={onStart}
        onReset={onReset}
      />

      <Track
        status={status}
        countdownText={countdownText}
        participants={participants}
        standings={standings}
        progressMap={progressMap}
        leaderPulseToken={leaderPulseToken}
        finishPulseTokenMap={finishPulseTokenMap}
        startKickToken={startKickToken}
      />

      <AnimatePresence>
        {status === 'finished' && (
          <Result
            standings={standings}
            onRestart={onStart}
            onReset={onReset}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
