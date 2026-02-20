export const ANIMAL_KEYS = [
  'cat',
  'dog',
  'duck',
  'elephant',
  'lion',
  'otter',
  'owl',
  'panda',
  'penguin',
  'rabbit',
  'shark',
  'sheep',
  'tiger',
  'turtle',
] as const

export const DEFAULT_PARTICIPANT_COUNT = 4
export const MAX_PARTICIPANT_COUNT = 12
export const MIN_PARTICIPANT_COUNT = 2
export const DEFAULT_DURATION_MS = 6200

export const buildDefaultName = (index: number) => `플레이어${index + 1}`
