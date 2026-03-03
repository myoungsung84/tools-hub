import type { Density, Language, SentenceLength } from './types'

export const LANGUAGE_LABEL: Record<Language, string> = {
  ko: '한국어',
  en: 'English',
}

export const DENSITY_LABEL: Record<Density, string> = {
  low: '낮음',
  normal: '보통',
  high: '높음',
}

export const SENTENCE_LENGTH_LABEL: Record<SentenceLength, string> = {
  short: '짧음',
  medium: '중간',
  long: '김',
}

export const PARAGRAPH_COUNT_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1)

export const KO_WORDS = {
  connectors: ['그리고', '그러나', '그래서', '문득', '어쩌면', '이따금'],
  subjects: [
    '바람',
    '구름',
    '새벽',
    '저녁',
    '빛',
    '그림자',
    '강물',
    '비',
    '가로등',
    '창문',
    '계단',
    '방',
  ],
  emotions: ['기억', '침묵', '온기', '불안', '흔적', '기대', '체온', '그리움'],
  objects: ['의자', '계단', '방', '가로등', '창문', '골목', '창가', '문턱', '책상'],
  verbs: ['스며든다', '번진다', '흐른다', '머문다', '흔들린다', '잦아든다', '겹쳐진다', '깨어난다'],
  tailVerbs: ['남긴다', '감싼다', '되살린다', '밀어낸다', '덧댄다', '잠재운다'],
  adjectives: ['느린', '옅은', '잔잔한', '가느다란', '낯선', '다정한', '희미한'],
  places: ['창문 곁', '계단 끝', '방 한켠', '가로등 아래', '강물 위', '젖은 골목', '문턱 앞'],
} as const

export const EN_WORDS = {
  connectors: ['and', 'but', 'perhaps', 'suddenly', 'meanwhile'],
  subjects: ['wind', 'cloud', 'dawn', 'evening', 'light', 'shadow', 'rain'],
  emotions: ['memory', 'silence', 'warmth', 'doubt', 'longing', 'trace', 'hope'],
  objects: ['chair', 'window', 'street', 'room', 'stair', 'lamp'],
  verbs: ['drifts', 'lingers', 'fades', 'settles', 'echoes', 'leans'],
  tailVerbs: ['returns', 'softens', 'stays', 'opens', 'blurs', 'waits'],
  adjectives: ['quiet', 'faint', 'slow', 'tender', 'distant', 'restless'],
  places: [
    'by the window',
    'under the lamp',
    'across the room',
    'along the stair',
    'over the street',
  ],
} as const
