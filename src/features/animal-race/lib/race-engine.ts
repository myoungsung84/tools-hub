export type ProgressMap = Record<string, number>

export type RaceParticipant = {
  id: string
  name: string
  animalKey: string
  seedOrder: number
  baseSpeed: number
  burstStart: number
  burstEnd: number
  burstBoost: number
  sprintVolatility: number
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

function clampProgressLowerBound(value: number) {
  return value <= 0 ? 0 : value
}

function phaseConfig(progress: number): PhaseConfig {
  if (progress < 20) return { multiplier: 0.76, jitterRange: 0.08 }
  if (progress < 40) return { multiplier: 0.96, jitterRange: 0.16 }
  if (progress <= 75) return { multiplier: 1.1, jitterRange: 0.48 }
  if (progress < 85) return { multiplier: 1.02, jitterRange: 0.22 }
  return { multiplier: 1.22, jitterRange: 0.34 }
}

export function tickRace({ participants, prevProgressMap, deltaMs }: TickRaceInput): TickRaceResult {
  const normalizedFrame = Math.max(0.4, Math.min(deltaMs / FRAME_MS, 2.8))
  const currentLeaderProgress = participants.reduce((max, participant) => {
    const current = prevProgressMap[participant.id] ?? 0
    return current > max ? current : max
  }, 0)
  const currentTailProgress = participants.reduce((min, participant) => {
    const current = prevProgressMap[participant.id] ?? 0
    return current < min ? current : min
  }, 100)

  const nextProgressMap: ProgressMap = { ...prevProgressMap }
  const finishedIds: string[] = []

  for (const participant of participants) {
    const current = prevProgressMap[participant.id] ?? 0
    if (current >= 100) {
      nextProgressMap[participant.id] = current
      continue
    }

    const phase = phaseConfig(current)
    const jitter = (Math.random() * 2 - 1) * phase.jitterRange
    const gap = Math.max(0, currentLeaderProgress - current)
    const leadFromTail = Math.max(0, current - currentTailProgress)
    const isMidPhase = current >= 40 && current <= 75
    const isSprintPhase = current >= 85

    const comebackBoost = isMidPhase ? Math.min(0.48, gap * 0.009) : 0
    const underdogBoost =
      isMidPhase && gap > 7 && Math.random() < 0.17 ? 0.09 + Math.random() * 0.16 : 0
    const burstBoost =
      isMidPhase && current >= participant.burstStart && current <= participant.burstEnd
        ? participant.burstBoost
        : 0

    const sprintBias = isSprintPhase ? 0.14 + (100 - current) * 0.0012 : 0
    const sprintInstability =
      isSprintPhase && leadFromTail > 7 ? (Math.random() * 2 - 1) * participant.sprintVolatility : 0

    const delta = Math.max(
      0.02,
      (
        participant.baseSpeed * phase.multiplier +
        jitter +
        comebackBoost +
        underdogBoost +
        burstBoost +
        sprintBias +
        sprintInstability
      ) * normalizedFrame
    )

    const next = clampProgressLowerBound(current + delta)
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
