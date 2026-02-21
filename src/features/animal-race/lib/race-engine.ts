export type ProgressMap = Record<string, number>

export type RaceParticipant = {
  id: string
  name: string
  animalKey: string
  seedOrder: number
  baseSpeed: number
}

export type RaceStanding = {
  id: string
  name: string
  animalKey: string
  seedOrder: number
  progress: number
}

type TickRaceInput = {
  participants: RaceParticipant[]
  prevProgressMap: ProgressMap
  deltaMs: number
}

type TickRaceResult = {
  nextProgressMap: ProgressMap
  finishedIds: string[]
  allFinished: boolean
}

type PhaseConfig = {
  multiplier: number
  jitterRange: number
}

const FRAME_MS = 1000 / 60

function clampProgress(value: number) {
  if (value <= 0) return 0
  if (value >= 100) return 100
  return value
}

function phaseConfig(progress: number): PhaseConfig {
  if (progress < 20) return { multiplier: 0.78, jitterRange: 0.1 }
  if (progress < 40) return { multiplier: 0.98, jitterRange: 0.18 }
  if (progress <= 75) return { multiplier: 1.12, jitterRange: 0.42 }
  if (progress < 85) return { multiplier: 1.02, jitterRange: 0.2 }
  return { multiplier: 1.26, jitterRange: 0.24 }
}

export function tickRace({ participants, prevProgressMap, deltaMs }: TickRaceInput): TickRaceResult {
  const normalizedFrame = Math.max(0.4, Math.min(deltaMs / FRAME_MS, 2.8))
  const currentLeaderProgress = participants.reduce((max, participant) => {
    const current = prevProgressMap[participant.id] ?? 0
    return current > max ? current : max
  }, 0)

  const nextProgressMap: ProgressMap = { ...prevProgressMap }
  const finishedIds: string[] = []

  for (const participant of participants) {
    const current = prevProgressMap[participant.id] ?? 0
    if (current >= 100) {
      nextProgressMap[participant.id] = 100
      continue
    }

    const phase = phaseConfig(current)
    const jitter = (Math.random() * 2 - 1) * phase.jitterRange
    const gap = Math.max(0, currentLeaderProgress - current)

    const comebackBoost = current >= 40 && current <= 75 ? Math.min(0.44, gap * 0.008) : 0
    const sprintBoost = current >= 85 ? 0.12 + (100 - current) * 0.001 : 0

    const delta = Math.max(
      0.02,
      (participant.baseSpeed * phase.multiplier + jitter + comebackBoost + sprintBoost) * normalizedFrame
    )

    const next = clampProgress(current + delta)
    nextProgressMap[participant.id] = next

    if (next >= 100 && current < 100) {
      finishedIds.push(participant.id)
    }
  }

  const allFinished = participants.every(participant => (nextProgressMap[participant.id] ?? 0) >= 100)

  return { nextProgressMap, finishedIds, allFinished }
}

export function computeStandings(
  participants: RaceParticipant[],
  progressMap: ProgressMap
): RaceStanding[] {
  return participants
    .map(participant => ({
      id: participant.id,
      name: participant.name,
      animalKey: participant.animalKey,
      seedOrder: participant.seedOrder,
      progress: progressMap[participant.id] ?? 0,
    }))
    .sort((a, b) => {
      if (b.progress !== a.progress) return b.progress - a.progress
      return a.seedOrder - b.seedOrder
    })
}
