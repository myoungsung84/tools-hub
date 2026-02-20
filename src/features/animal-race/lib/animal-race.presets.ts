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

export const ANIMAL_LABELS: Record<(typeof ANIMAL_KEYS)[number], string> = {
  cat: '고양이',
  dog: '강아지',
  duck: '오리',
  elephant: '코끼리',
  lion: '사자',
  otter: '수달',
  owl: '부엉이',
  panda: '판다',
  penguin: '펭귄',
  rabbit: '토끼',
  shark: '상어',
  sheep: '양',
  tiger: '호랑이',
  turtle: '거북이',
}

export const DEFAULT_PARTICIPANT_COUNT = 4
export const MAX_PARTICIPANT_COUNT = 12
export const MIN_PARTICIPANT_COUNT = 2
export const DEFAULT_DURATION_MS = 5200

export const buildDefaultName = (animalKey: (typeof ANIMAL_KEYS)[number], index: number) =>
  `${ANIMAL_LABELS[animalKey]} ${index + 1}`
