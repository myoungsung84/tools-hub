'use client'

import { AnimatePresence } from 'framer-motion'
import { Flag } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import PageHeader from '@/components/layout/page-header'

import {
  COUNTDOWN_STEPS,
  DEFAULT_PARTICIPANTS,
  makeStableParticipants,
  rerollStats,
} from '../lib/constants'
import {
  computeStandings,
  type ProgressMap,
  type RaceParticipant,
  tickRace,
} from '../lib/race-engine'
import type { RaceStatus } from '../lib/types'
import Controls from './components/controls'
import Result from './components/result'
import Track from './components/track'

function makeProgressMap(participants: RaceParticipant[]): ProgressMap {
  return Object.fromEntries(participants.map(p => [p.id, 0]))
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
        title='동물 레이싱'
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

      <AnimatePresence mode='wait'>
        <Result
          standings={status === 'FINISH' ? standings : []}
          status={status}
          participantCount={participantCount}
          onRestart={onStart}
          onReset={onReset}
        />
      </AnimatePresence>
    </div>
  )
}
