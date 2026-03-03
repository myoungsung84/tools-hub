export type Language = 'ko' | 'en'
export type Density = 'low' | 'normal' | 'high'
export type SentenceLength = 'short' | 'medium' | 'long'

export type GenerateParagraphOptions = {
  language: Language
  density: Density
  sentenceLength: SentenceLength
  lineBreak: boolean
}

export type GenerateLoremTextOptions = GenerateParagraphOptions & {
  paragraphCount: number
}

export type LoremOutputStats = {
  chars: number
  words: number
  lines: number
}
