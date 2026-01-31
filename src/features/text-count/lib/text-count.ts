export type TextCountResult = {
  charsWithSpaces: number
  charsNoSpaces: number
  words: number
  lines: number
  bytesUtf8: number
  selection?: {
    charsWithSpaces: number
    charsNoSpaces: number
    words: number
    lines: number
    bytesUtf8: number
    from: number
    to: number
  } | null
}

function countWords(text: string) {
  const trimmed = text.trim()
  if (trimmed === '') return 0
  // 공백류(스페이스/탭/줄바꿈 등) 기준으로 단어 분리
  return trimmed.split(/\s+/).filter(Boolean).length
}

function countLines(text: string) {
  if (text === '') return 0
  // 마지막 줄바꿈 포함 케이스도 1줄로 취급되게
  return text.split(/\r\n|\n|\r/).length
}

function countBytesUtf8(text: string) {
  // UTF-8 정확 계산 (한글 3 bytes, 이모지 4 bytes 등)
  return new TextEncoder().encode(text).length
}

function countCharsNoSpaces(text: string) {
  // 모든 공백류 제거
  return text.replace(/\s/g, '').length
}

export function calcTextCount(
  text: string,
  selection?: { from: number; to: number } | null
): TextCountResult {
  const base = {
    charsWithSpaces: text.length,
    charsNoSpaces: countCharsNoSpaces(text),
    words: countWords(text),
    lines: countLines(text),
    bytesUtf8: countBytesUtf8(text),
  }

  if (!selection || selection.from === selection.to) {
    return { ...base, selection: null }
  }

  const from = Math.max(0, Math.min(selection.from, text.length))
  const to = Math.max(0, Math.min(selection.to, text.length))
  const slice = text.slice(Math.min(from, to), Math.max(from, to))

  return {
    ...base,
    selection: {
      charsWithSpaces: slice.length,
      charsNoSpaces: countCharsNoSpaces(slice),
      words: countWords(slice),
      lines: countLines(slice),
      bytesUtf8: countBytesUtf8(slice),
      from: Math.min(from, to),
      to: Math.max(from, to),
    },
  }
}
