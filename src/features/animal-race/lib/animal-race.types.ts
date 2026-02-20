import type { ANIMAL_KEYS } from './animal-race.presets'

export type AnimalKey = (typeof ANIMAL_KEYS)[number]

export type Participant = {
  id: string
  name: string
  animalKey: AnimalKey
  power?: number
  laps?: number
}

export type RaceConfig = {
  participantCount: number
  durationMs: number
  seed: string
  allowDuplicates: boolean
  sabotageEnabled: boolean
}

export type RaceTimeline = {
  participantId: string
  progress: number[]
}

export type RaceResult = {
  finishOrder: string[]
  timeline: RaceTimeline[]
}
