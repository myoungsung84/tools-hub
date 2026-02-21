import type { RaceParticipant } from '../lib/race-engine'

export const MIN_PARTICIPANTS = 2
export const MAX_PARTICIPANTS = 14
export const DEFAULT_PARTICIPANTS = 8
export const COUNTDOWN_STEPS = [3, 2, 1, 'GO'] as const

type AnimalPreset = {
  key: string
  name: string
}

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

export function makeStableParticipants(count: number): RaceParticipant[] {
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

export function rerollStats(participants: RaceParticipant[]): RaceParticipant[] {
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
