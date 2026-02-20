'use client'

import { sample, shuffle } from 'lodash-es'
import * as React from 'react'

import { runAnimalRace } from '../lib/animal-race.engine'
import {
  ANIMAL_KEYS,
  buildDefaultName,
  DEFAULT_DURATION_MS,
  DEFAULT_PARTICIPANT_COUNT,
  MAX_PARTICIPANT_COUNT,
  MIN_PARTICIPANT_COUNT,
} from '../lib/animal-race.presets'
import { raceConfigSchema } from '../lib/animal-race.schema'
import type { AnimalKey, Participant, RaceConfig, RaceResult } from '../lib/animal-race.types'
import AnimalRaceControls from './components/animal-race-controls'
import AnimalRacePodium from './components/animal-race-podium'
import AnimalRaceStandings from './components/animal-race-standings'
import AnimalRaceTrack from './components/animal-race-track'
import AnimalRaceCountdown from './motion/animal-race-countdown'

const pickAnimalKeys = (count: number, allowDuplicates: boolean): AnimalKey[] => {
  if (allowDuplicates) {
    return Array.from({ length: count }, () => sample(ANIMAL_KEYS) ?? ANIMAL_KEYS[0])
  }

  return shuffle([...ANIMAL_KEYS]).slice(0, count)
}

const buildParticipants = (count: number, allowDuplicates: boolean): Participant[] => {
  const assignedKeys = pickAnimalKeys(count, allowDuplicates)

  return Array.from({ length: count }, (_, index) => ({
    id: `participant-${index + 1}`,
    name: buildDefaultName(index),
    animalKey: assignedKeys[index],
  }))
}

export default function AnimalRacePage() {
  const [config, setConfig] = React.useState<RaceConfig>({
    participantCount: DEFAULT_PARTICIPANT_COUNT,
    durationMs: DEFAULT_DURATION_MS,
    seed: 'animal-race-seed',
    allowDuplicates: false,
    sabotageEnabled: false,
  })
  const [participants, setParticipants] = React.useState<Participant[]>(() =>
    buildParticipants(DEFAULT_PARTICIPANT_COUNT, false)
  )
  const [raceResult, setRaceResult] = React.useState<RaceResult | null>(null)
  const [isRacing, setIsRacing] = React.useState(false)
  const [frameIndex, setFrameIndex] = React.useState(0)
  const [countdown, setCountdown] = React.useState<number | null>(null)
  const [controlsCollapsed, setControlsCollapsed] = React.useState(false)

  const raceTimerRef = React.useRef<number | null>(null)
  const countdownTimerRef = React.useRef<number | null>(null)

  const clearTimers = React.useCallback(() => {
    if (raceTimerRef.current) {
      window.clearInterval(raceTimerRef.current)
      raceTimerRef.current = null
    }

    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
  }, [])

  const resetRaceState = React.useCallback(() => {
    clearTimers()
    setRaceResult(null)
    setFrameIndex(0)
    setIsRacing(false)
    setCountdown(null)
  }, [clearTimers])

  React.useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  const progressMap = React.useMemo(() => {
    if (!raceResult) {
      return Object.fromEntries(participants.map((participant) => [participant.id, 0]))
    }

    return Object.fromEntries(
      raceResult.timeline.map((lane) => [lane.participantId, lane.progress[Math.min(frameIndex, lane.progress.length - 1)]])
    )
  }, [frameIndex, participants, raceResult])

  React.useEffect(() => {
    if (!raceResult || !isRacing) return

    const maxFrame = raceResult.timeline[0]?.progress.length ?? 0
    raceTimerRef.current = window.setInterval(() => {
      setFrameIndex((prev) => {
        if (prev >= maxFrame - 1) {
          if (raceTimerRef.current) {
            window.clearInterval(raceTimerRef.current)
            raceTimerRef.current = null
          }
          setIsRacing(false)
          return prev
        }
        return prev + 1
      })
    }, 50)

    return () => {
      if (raceTimerRef.current) {
        window.clearInterval(raceTimerRef.current)
        raceTimerRef.current = null
      }
    }
  }, [isRacing, raceResult])

  const reassignAnimals = React.useCallback(() => {
    const assignedKeys = pickAnimalKeys(participants.length, config.allowDuplicates)

    setParticipants((prev) =>
      prev.map((participant, index) => ({
        ...participant,
        animalKey: assignedKeys[index],
      }))
    )
  }, [config.allowDuplicates, participants.length])

  const onParticipantCountChange = (value: number) => {
    const nextCount = Math.min(MAX_PARTICIPANT_COUNT, Math.max(MIN_PARTICIPANT_COUNT, value))
    resetRaceState()

    setConfig((prev) => raceConfigSchema.parse({ ...prev, participantCount: nextCount }))
    setParticipants((prev) => {
      const next = buildParticipants(nextCount, config.allowDuplicates)

      return next.map((participant, index) => ({
        ...participant,
        name: prev[index]?.name || participant.name,
      }))
    })
  }

  const onStart = () => {
    if (isRacing || countdown !== null || participants.length < MIN_PARTICIPANT_COUNT) return

    setCountdown(3)
    countdownTimerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            window.clearInterval(countdownTimerRef.current)
            countdownTimerRef.current = null
          }

          const nextSeed = `${Date.now()}-${participants.length}-${config.allowDuplicates}`
          const nextConfig = raceConfigSchema.parse({ ...config, seed: nextSeed })
          const result = runAnimalRace(participants, nextConfig)
          setConfig(nextConfig)
          setRaceResult(result)
          setFrameIndex(0)
          setIsRacing(true)
          return null
        }

        return prev - 1
      })
    }, 500)
  }

  const onReset = () => {
    resetRaceState()
  }

  const top3 = React.useMemo(() => {
    if (!raceResult) return []

    return raceResult.finishOrder
      .slice(0, 3)
      .map((id) => participants.find((participant) => participant.id === id))
      .filter((participant): participant is Participant => Boolean(participant))
  }, [participants, raceResult])

  return (
    <div className='grid gap-4 md:grid-cols-[320px_1fr]'>
      <div className='space-y-3'>
        <AnimalRaceControls
          participantCount={config.participantCount}
          allowDuplicates={config.allowDuplicates}
          sabotageEnabled={config.sabotageEnabled}
          isRacing={isRacing}
          isCollapsed={controlsCollapsed}
          onToggleCollapsed={() => setControlsCollapsed((prev) => !prev)}
          onCountChange={onParticipantCountChange}
          onShuffleAnimals={reassignAnimals}
          onAllowDuplicatesChange={(value) => {
            resetRaceState()
            setConfig((prev) => raceConfigSchema.parse({ ...prev, allowDuplicates: value }))
          }}
          onSabotageChange={(value) =>
            setConfig((prev) => raceConfigSchema.parse({ ...prev, sabotageEnabled: value }))
          }
          onStart={onStart}
          onReset={onReset}
        />

        <section className='rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm'>
          <p className='mb-2 text-sm text-white/80'>참가자 이름</p>
          <div className='space-y-2'>
            {participants.map((participant, index) => (
              <input
                key={participant.id}
                value={participant.name}
                onChange={(event) => {
                  const value = event.target.value
                  setParticipants((prev) =>
                    prev.map((item) => (item.id === participant.id ? { ...item, name: value } : item))
                  )
                }}
                disabled={isRacing}
                placeholder={buildDefaultName(index)}
                className='w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-white/30 placeholder:text-white/40 focus:ring'
              />
            ))}
          </div>
        </section>
      </div>

      <div className='relative space-y-4'>
        <AnimalRaceCountdown value={countdown} />
        <AnimalRaceTrack
          participants={participants}
          progressMap={progressMap}
          isRacing={isRacing}
          finishOrder={raceResult?.finishOrder ?? []}
        />
        <AnimalRaceStandings participants={participants} progressMap={progressMap} />
        <AnimalRacePodium top3={top3} />
      </div>
    </div>
  )
}
