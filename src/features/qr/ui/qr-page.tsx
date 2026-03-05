'use client'

import { debounce, isNil } from 'lodash-es'
import { QrCode } from 'lucide-react'
import * as React from 'react'

import PageHeader from '@/components/layout/page-header'
import { TooltipProvider } from '@/components/ui/tooltip'

import {
  buildQrFileName,
  buildQrPngDataUrl,
  buildQrSvgText,
  downloadPng,
  downloadSvg,
  QrOptions,
} from '../lib/qr'
import { QrDesignCard } from './components/qr-design-card'
import { QrInputCard } from './components/qr-input-card'
import { QrPreviewCard } from './components/qr-preview-card'

// QR 코드 권장 최대 길이 (에러 보정 레벨 M 기준, 안전하게 스캔 가능한 범위)
// Version 40 QR (최대): ~2953자 (숫자), ~1852자 (영문), ~1273자 (한글 포함 바이너리)
// 하지만 실용성을 고려하면 500~800자 권장 (스캔 안정성 + 복잡도)
const MAX_TEXT_LENGTH = 800
// 경고 표시 임계값 (이 이상부터는 QR이 복잡해져 스캔 어려움)
const WARNING_TEXT_LENGTH = 500

const DEFAULTS: { text: string; options: QrOptions } = {
  text: '',
  options: {
    size: 'm',
    level: 'M',
    margin: 1,
    fgColor: '#000000',
    bgColor: '#ffffff',
  },
}

export default function QrPage() {
  const [text, setText] = React.useState(DEFAULTS.text)
  const [options, setOptions] = React.useState<QrOptions>(DEFAULTS.options)

  const [pngDataUrl, setPngDataUrl] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isBuilding, setIsBuilding] = React.useState(false)
  const [justDownloaded, setJustDownloaded] = React.useState<'png' | 'svg' | null>(null)

  const trimmed = text.trim()
  const hasInput = trimmed.length > 0
  const textLength = trimmed.length
  const isTextTooLong = textLength > MAX_TEXT_LENGTH
  const shouldShowWarning = textLength > WARNING_TEXT_LENGTH && textLength <= MAX_TEXT_LENGTH

  const updateOption = React.useCallback(
    <K extends keyof QrOptions>(key: K, value: QrOptions[K]) => {
      setOptions(prev => ({ ...prev, [key]: value }))
    },
    []
  )

  const applyPreset = React.useCallback((fg: string, bg: string) => {
    setOptions(prev => ({ ...prev, fgColor: fg, bgColor: bg }))
  }, [])

  const buildPng = React.useMemo(() => {
    let reqId = 0

    const run = async (nextText: string, nextOpts: QrOptions) => {
      const id = ++reqId
      const nextTrimmed = nextText.trim()

      if (nextTrimmed.length === 0) {
        setPngDataUrl(null)
        setError(null)
        setIsBuilding(false)
        return
      }

      // 텍스트 길이 체크
      if (nextTrimmed.length > MAX_TEXT_LENGTH) {
        setPngDataUrl(null)
        setError(
          `텍스트가 너무 깁니다. 최대 ${MAX_TEXT_LENGTH.toLocaleString()}자까지 지원됩니다. (현재: ${nextTrimmed.length.toLocaleString()}자)`
        )
        setIsBuilding(false)
        return
      }

      setIsBuilding(true)
      setError(null)

      try {
        const url = await buildQrPngDataUrl({ text: nextTrimmed, opts: nextOpts })
        if (id !== reqId) return
        setPngDataUrl(url)
      } catch (e) {
        if (id !== reqId) return
        setPngDataUrl(null)
        setError(e instanceof Error ? e.message : 'QR 생성에 실패했습니다.')
      } finally {
        if (id === reqId) setIsBuilding(false)
      }
    }

    return debounce(run, 200)
  }, [])

  React.useEffect(() => {
    buildPng(text, options)
    return () => buildPng.cancel()
  }, [text, options, buildPng])

  const canDownloadPng = !isNil(pngDataUrl) && pngDataUrl !== '' && !isBuilding && !error
  const canDownloadSvg = hasInput && !error && !isTextTooLong

  const onDownloadPng = React.useCallback(async () => {
    if (!pngDataUrl) return
    await downloadPng({ dataUrl: pngDataUrl, filename: buildQrFileName({ ext: 'png' }) })
    setJustDownloaded('png')
    setTimeout(() => setJustDownloaded(null), 2000)
  }, [pngDataUrl])

  const onDownloadSvg = React.useCallback(async () => {
    if (!hasInput || isTextTooLong) return
    const svg = await buildQrSvgText({ text: trimmed, opts: options })
    downloadSvg({ svgText: svg, filename: buildQrFileName({ ext: 'svg' }) })
    setJustDownloaded('svg')
    setTimeout(() => setJustDownloaded(null), 2000)
  }, [hasInput, trimmed, options, isTextTooLong])

  const onReset = React.useCallback(() => {
    setText(DEFAULTS.text)
    setOptions(DEFAULTS.options)
    setPngDataUrl(null)
    setError(null)
    setIsBuilding(false)
  }, [])

  const status = React.useMemo(() => {
    if (!hasInput) return { label: '입력 대기', dot: 'bg-muted-foreground/40' }
    if (isTextTooLong) return { label: '텍스트 초과', dot: 'bg-destructive' }
    if (isBuilding) return { label: '생성 중...', dot: 'bg-primary animate-pulse' }
    if (pngDataUrl && !error) return { label: '준비 완료', dot: 'bg-green-500' }
    if (error) return { label: '오류', dot: 'bg-destructive' }
    return { label: '대기', dot: 'bg-muted-foreground/60' }
  }, [hasInput, isBuilding, pngDataUrl, error, isTextTooLong])

  return (
    <TooltipProvider>
      <div>
        <PageHeader
          icon={QrCode}
          kicker='QR 코드 생성기'
          title='나만의 QR 코드를 쉽고 빠르게.'
          description='URL이나 텍스트를 입력하고, 테마/색상/옵션을 조정해보세요.'
        />

        <div className='grid gap-8 lg:grid-cols-12'>
          <div className='space-y-6 lg:col-span-7'>
            <QrInputCard
              text={text}
              onTextChange={setText}
              textLength={textLength}
              maxTextLength={MAX_TEXT_LENGTH}
              isTextTooLong={isTextTooLong}
              shouldShowWarning={shouldShowWarning}
            />

            <QrDesignCard
              options={options}
              updateOption={updateOption}
              applyPreset={applyPreset}
              onDownloadPng={onDownloadPng}
              onDownloadSvg={onDownloadSvg}
              onReset={onReset}
              canDownloadPng={canDownloadPng}
              canDownloadSvg={canDownloadSvg}
              justDownloaded={justDownloaded}
              error={error}
              isTextTooLong={isTextTooLong}
            />
          </div>

          <div className='lg:col-span-5'>
            <QrPreviewCard
              isBuilding={isBuilding}
              pngDataUrl={pngDataUrl}
              status={status}
              size={options.size}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
