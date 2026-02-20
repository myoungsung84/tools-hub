import { range } from 'lodash-es'

import { createSeededRandom, shuffleSeeded } from './animal-race.rng'
import { participantListSchema, raceConfigSchema, raceResultSchema } from './animal-race.schema'
import type { Participant, RaceConfig, RaceResult } from './animal-race.types'

const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2

export const runAnimalRace = (participants: Participant[], config: RaceConfig): RaceResult => {
  const parsedConfig = raceConfigSchema.parse(config)
  const parsedParticipants = participantListSchema.parse(participants).slice(0, parsedConfig.participantCount)

  const finishOrder = shuffleSeeded(
    parsedParticipants.map((participant) => participant.id),
    parsedConfig.seed
  )

  const rankMap = new Map(finishOrder.map((id, index) => [id, index]))
  const rand = createSeededRandom(parsedConfig.seed)
  const frames = Math.max(60, Math.floor(parsedConfig.durationMs / 50))

  const timeline = parsedParticipants.map((participant) => {
    const rankIndex = rankMap.get(participant.id) ?? parsedParticipants.length - 1
    const boost = (parsedParticipants.length - rankIndex) / parsedParticipants.length

    const progress = range(0, frames + 1).map((frame) => {
      const t = frame / frames
      const shape = easeInOut(t)
      const wobble = (rand() - 0.5) * 0.03 * (1 - t)
      const weighted = shape * (0.84 + boost * 0.16) + wobble
      return Number(Math.max(0, Math.min(1, weighted)).toFixed(4))
    })

    progress[progress.length - 1] = 1

    return {
      participantId: participant.id,
      progress,
    }
  })

  return raceResultSchema.parse({
    finishOrder,
    timeline,
  })
}
