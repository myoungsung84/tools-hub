import dayjs from 'dayjs'
import QRCode from 'qrcode'

export const QR_SIZE_MAP = {
  s: 128,
  m: 256,
  l: 384,
  xl: 512,
} as const

export type QrSize = keyof typeof QR_SIZE_MAP

export type QrOptions = {
  size: QrSize
  margin: number
  fgColor: string
  bgColor: string
  level: 'L' | 'M' | 'Q' | 'H'
}

export const COLOR_PRESETS: Array<{ name: string; fg: string; bg: string }> = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' }, // 밝은
  { name: 'Dark', fg: '#ffffff', bg: '#1e293b' }, // 어두운 (slate-800)
  { name: 'Blue', fg: '#1e3a8a', bg: '#eff6ff' }, // 밝은 (blue-900 / blue-50)
  { name: 'Navy', fg: '#f0f9ff', bg: '#0c4a6e' }, // 어두운 (sky-50 / sky-900)
  { name: 'Red', fg: '#991b1b', bg: '#fef2f2' }, // 밝은 (red-800 / red-50)
  { name: 'Crimson', fg: '#fef2f2', bg: '#7f1d1d' }, // 어두운 (red-50 / red-900)
  { name: 'Green', fg: '#15803d', bg: '#f0fdf4' }, // 밝은 (green-700 / green-50)
  { name: 'Forest', fg: '#ecfdf5', bg: '#064e3b' }, // 어두운 (emerald-50 / emerald-900)
  { name: 'Purple', fg: '#6d28d9', bg: '#faf5ff' }, // 밝은 (violet-700 / violet-50)
  { name: 'Plum', fg: '#f5f3ff', bg: '#4c1d95' }, // 어두운 (violet-50 / violet-900)
  { name: 'Orange', fg: '#c2410c', bg: '#fff7ed' }, // 밝은 (orange-700 / orange-50)
  { name: 'Bronze', fg: '#fffbeb', bg: '#78350f' }, // 어두운 (amber-50 / amber-900)
  { name: 'Teal', fg: '#0f766e', bg: '#f0fdfa' }, // 밝은 (teal-700 / teal-50)
  { name: 'Ocean', fg: '#ecfeff', bg: '#164e63' }, // 어두운 (cyan-50 / cyan-900)
  { name: 'Pink', fg: '#be185d', bg: '#fdf2f8' }, // 밝은 (pink-700 / pink-50)
  { name: 'Magenta', fg: '#fdf4ff', bg: '#701a75' }, // 어두운 (fuchsia-50 / fuchsia-900)
  { name: 'Indigo', fg: '#4338ca', bg: '#eef2ff' }, // 밝은 (indigo-700 / indigo-50)
  { name: 'Midnight', fg: '#e0e7ff', bg: '#312e81' }, // 어두운 (indigo-100 / indigo-900)
  { name: 'Lime', fg: '#4d7c0f', bg: '#f7fee7' }, // 밝은 (lime-700 / lime-50)
  { name: 'Slate', fg: '#f1f5f9', bg: '#0f172a' }, // 어두운 (slate-100 / slate-900)
]

export function buildQrFileName(params: { ext: 'png' | 'svg' }) {
  const ts = dayjs().format('YYYYMMDD-HHmmss')
  return `qr-tools-hub-${ts}.${params.ext}`
}

export async function buildQrPngDataUrl(params: { text: string; opts: QrOptions }) {
  const { text, opts } = params
  const width = QR_SIZE_MAP[opts.size]

  return QRCode.toDataURL(text, {
    width,
    margin: opts.margin,
    errorCorrectionLevel: opts.level,
    color: { dark: opts.fgColor, light: opts.bgColor },
  })
}

export async function buildQrSvgText(params: { text: string; opts: QrOptions }) {
  const { text, opts } = params
  const width = QR_SIZE_MAP[opts.size]

  return QRCode.toString(text, {
    type: 'svg',
    width,
    margin: opts.margin,
    errorCorrectionLevel: opts.level,
    color: { dark: opts.fgColor, light: opts.bgColor },
  })
}

export function downloadBlob(params: { blob: Blob; filename: string }) {
  const { blob, filename } = params
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}

export async function downloadPng(params: { dataUrl: string; filename: string }) {
  const res = await fetch(params.dataUrl)
  const blob = await res.blob()
  downloadBlob({ blob, filename: params.filename })
}

export function downloadSvg(params: { svgText: string; filename: string }) {
  const blob = new Blob([params.svgText], { type: 'image/svg+xml;charset=utf-8' })
  downloadBlob({ blob, filename: params.filename })
}
