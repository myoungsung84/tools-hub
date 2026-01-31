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
