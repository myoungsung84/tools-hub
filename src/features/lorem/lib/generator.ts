import { EN_WORDS, KO_WORDS } from './constants'
import type {
  Density,
  GenerateLoremTextOptions,
  GenerateParagraphOptions,
  LoremOutputStats,
  SentenceLength,
} from './types'

function pick<T>(list: readonly T[]) {
  return list[Math.floor(Math.random() * list.length)]
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function capitalize(word: string) {
  if (!word) return word
  return `${word[0].toUpperCase()}${word.slice(1)}`
}

function sentenceCountByDensity(density: Density) {
  if (density === 'low') return randomInt(2, 3)
  if (density === 'normal') return randomInt(4, 5)
  return randomInt(6, 8)
}

function buildKoSentence(sentenceLength: SentenceLength) {
  const connector = pick(KO_WORDS.connectors)
  const subject = pick(KO_WORDS.subjects)
  const emotion = pick(KO_WORDS.emotions)
  const place = pick(KO_WORDS.places)
  const verb = pick(KO_WORDS.verbs)

  if (sentenceLength === 'short') {
    return `${connector} ${subject}의 ${emotion}이 ${place}에 ${verb}.`
  }

  const adjective = pick(KO_WORDS.adjectives)
  const object = pick(KO_WORDS.objects)
  const tailVerb = pick(KO_WORDS.tailVerbs)

  if (sentenceLength === 'medium') {
    return `${connector} ${subject}의 ${emotion}이 ${place}에 ${verb}, ${adjective} ${object}를 ${tailVerb}.`
  }

  const connector2 = pick(KO_WORDS.connectors)
  const subject2 = pick(KO_WORDS.subjects)
  const emotion2 = pick(KO_WORDS.emotions)

  return `${connector} ${subject}의 ${emotion}이 ${place}에 ${verb}, ${adjective} ${object}를 ${tailVerb}, ${connector2} ${subject2}의 ${emotion2}이 오래 머문다.`
}

function buildEnSentence(sentenceLength: SentenceLength) {
  const connector = capitalize(pick(EN_WORDS.connectors))
  const subject = pick(EN_WORDS.subjects)
  const emotion = pick(EN_WORDS.emotions)
  const place = pick(EN_WORDS.places)
  const verb = pick(EN_WORDS.verbs)

  if (sentenceLength === 'short') {
    return `${connector} the ${subject} of ${emotion} ${verb} ${place}.`
  }

  const adjective = pick(EN_WORDS.adjectives)
  const object = pick(EN_WORDS.objects)
  const tailVerb = pick(EN_WORDS.tailVerbs)

  if (sentenceLength === 'medium') {
    return `${connector} the ${subject} of ${emotion} ${verb} ${place}, and a ${adjective} ${object} ${tailVerb}.`
  }

  const connector2 = pick(EN_WORDS.connectors)
  const emotion2 = pick(EN_WORDS.emotions)
  const object2 = pick(EN_WORDS.objects)

  return `${connector} the ${subject} of ${emotion} ${verb} ${place}, and a ${adjective} ${object} ${tailVerb} beside the ${object2}, but ${connector2} the ${emotion2} keeps moving.`
}

function generateParagraph({
  language,
  density,
  sentenceLength,
  lineBreak,
}: GenerateParagraphOptions) {
  const sentenceCount = sentenceCountByDensity(density)
  const sentenceJoiner = lineBreak ? '\n' : ' '
  const sentences = Array.from({ length: sentenceCount }, () =>
    language === 'ko' ? buildKoSentence(sentenceLength) : buildEnSentence(sentenceLength)
  )

  return sentences.join(sentenceJoiner)
}

export function generateLoremText({
  language,
  paragraphCount,
  density,
  sentenceLength,
  lineBreak,
}: GenerateLoremTextOptions) {
  return Array.from({ length: paragraphCount }, () =>
    generateParagraph({ language, density, sentenceLength, lineBreak })
  ).join('\n\n')
}

export function analyzeLoremOutput(output: string): LoremOutputStats {
  const trimmed = output.trim()
  if (!trimmed) return { chars: 0, words: 0, lines: 0 }

  const words = trimmed.split(/\s+/).filter(Boolean).length
  const lines = trimmed
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean).length

  return {
    chars: trimmed.length,
    words,
    lines,
  }
}
