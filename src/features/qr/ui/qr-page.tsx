'use client'

import { debounce, isNil } from 'lodash-es'
import {
  AlertCircle,
  Check,
  Download,
  Info,
  Loader2,
  Palette,
  QrCode,
  RotateCcw,
  Square,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/client'

import {
  buildQrFileName,
  buildQrPngDataUrl,
  buildQrSvgText,
  COLOR_PRESETS,
  downloadPng,
  downloadSvg,
  QR_SIZE_MAP,
  QrOptions,
  QrSize,
} from '../lib/qr'

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

function IconTip(props: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          className='inline-flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground'
        >
          <Info className='h-3.5 w-3.5' />
        </button>
      </TooltipTrigger>
      <TooltipContent>{props.text}</TooltipContent>
    </Tooltip>
  )
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
      <div className='mx-auto w-full max-w-6xl px-4 py-10'>
        {/* Header */}
        <div className='mb-8 flex flex-col gap-2'>
          <div className='flex items-center gap-2 text-primary'>
            <QrCode className='h-6 w-6' />
            <span className='font-bold uppercase tracking-wider'>QR Generator</span>
          </div>
          <h1 className='text-3xl font-extrabold tracking-tight lg:text-4xl'>
            나만의 QR 코드를 쉽고 빠르게.
          </h1>
          <p className='text-muted-foreground'>
            URL이나 텍스트를 입력하고, 테마/색상/옵션을 조정해보세요.
          </p>
        </div>

        <div className='grid gap-8 lg:grid-cols-12'>
          {/* Left: Settings */}
          <div className='space-y-6 lg:col-span-7'>
            <Card>
              <CardHeader>
                <CardTitle>내용 입력</CardTitle>
                <CardDescription>QR 코드로 변환할 정보를 입력하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder='https://example.com'
                  className={cn(
                    'min-h-[120px] resize-none text-base transition-shadow focus-visible:shadow-sm',
                    isTextTooLong && 'border-destructive focus-visible:ring-destructive'
                  )}
                />

                {/* 텍스트 길이 표시 */}
                <div className='mt-2 flex items-center justify-between'>
                  <div className='text-xs text-muted-foreground'>
                    공백만 있으면 생성되지 않습니다. 너무 긴 텍스트는 스캔이 어려울 수 있어요.
                  </div>
                  <div
                    className={cn(
                      'text-xs font-medium',
                      isTextTooLong && 'text-destructive',
                      shouldShowWarning && 'text-orange-500',
                      !shouldShowWarning && !isTextTooLong && 'text-muted-foreground'
                    )}
                  >
                    {textLength.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}자
                  </div>
                </div>

                {/* 경고 메시지 */}
                {shouldShowWarning && (
                  <div className='mt-3 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200'>
                    <AlertCircle className='h-4 w-4 flex-shrink-0 mt-0.5' />
                    <div>
                      <div className='font-medium'>텍스트가 깁니다</div>
                      <div className='text-xs mt-1'>
                        {MAX_TEXT_LENGTH - textLength}자 남았습니다. QR 코드가 복잡해져 스캔이
                        어려울 수 있어요.
                      </div>
                    </div>
                  </div>
                )}

                {/* 에러 메시지 */}
                {isTextTooLong && (
                  <div className='mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive'>
                    <AlertCircle className='h-4 w-4 flex-shrink-0 mt-0.5' />
                    <div>
                      <div className='font-medium'>최대 길이 초과</div>
                      <div className='text-xs mt-1'>
                        텍스트를 {(textLength - MAX_TEXT_LENGTH).toLocaleString()}자 줄여주세요.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>디자인 설정</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Presets */}
                <div className='space-y-3'>
                  <Label className='flex items-center gap-2 text-muted-foreground'>
                    <Palette className='h-4 w-4' />
                    추천 색상 테마
                  </Label>
                  <div className='flex flex-wrap gap-3'>
                    {COLOR_PRESETS.map(preset => (
                      <button
                        key={preset.name}
                        type='button'
                        onClick={() => applyPreset(preset.fg, preset.bg)}
                        className={cn(
                          'group relative flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                          options.fgColor === preset.fg &&
                            options.bgColor === preset.bg &&
                            'ring-2 ring-primary ring-offset-2'
                        )}
                        style={{ backgroundColor: preset.bg }}
                        title={preset.name}
                      >
                        <div
                          className='h-5 w-5 rounded-sm transition-transform group-hover:scale-110'
                          style={{ backgroundColor: preset.fg }}
                        />
                        {options.fgColor === preset.fg && options.bgColor === preset.bg && (
                          <div className='absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-sm'>
                            <Check
                              className='h-2.5 w-2.5 text-primary-foreground'
                              strokeWidth={3}
                            />
                          </div>
                        )}
                        <span className='sr-only'>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {`프리셋은 "빠른 시작"용이에요. 아래에서 직접 색상도 조정할 수 있어요.`}
                  </div>
                </div>

                <Separator />

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  {/* Size */}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Label>해상도 (Size)</Label>
                      <IconTip text='QR 출력 크기(px). 인쇄/고해상도면 L~XL 추천.' />
                    </div>
                    <Select
                      value={options.size}
                      onValueChange={v => updateOption('size', v as QrSize)}
                    >
                      <SelectTrigger className='transition-shadow focus:shadow-sm'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='s'>Small (128px)</SelectItem>
                        <SelectItem value='m'>Medium (256px)</SelectItem>
                        <SelectItem value='l'>Large (384px)</SelectItem>
                        <SelectItem value='xl'>Extra Large (512px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Error level */}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Label>에러 보정 (Level)</Label>
                      <IconTip text='손상/가림 복구 강도. 일반은 M, 로고/훼손 가능성이 있으면 Q/H 추천.' />
                    </div>
                    <Select
                      value={options.level}
                      onValueChange={v => updateOption('level', v as 'L' | 'M' | 'Q' | 'H')}
                    >
                      <SelectTrigger className='transition-shadow focus:shadow-sm'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='L'>Low (7%)</SelectItem>
                        <SelectItem value='M'>Medium (15%)</SelectItem>
                        <SelectItem value='Q'>Quartile (25%)</SelectItem>
                        <SelectItem value='H'>High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Margin */}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Label htmlFor='qr-margin'>테두리 여백</Label>
                      <IconTip text='스캔 안정성 때문에 1~2 권장. 0은 환경에 따라 인식이 떨어질 수 있어요.' />
                    </div>
                    <Input
                      id='qr-margin'
                      type='number'
                      min={0}
                      max={10}
                      value={options.margin}
                      onChange={e => updateOption('margin', Number(e.target.value))}
                      className='transition-shadow focus-visible:shadow-sm'
                    />
                    <div className='text-xs text-muted-foreground'>
                      권장: 1~2 (스캐너가 테두리를 좋아함)
                    </div>
                  </div>

                  {/* Colors */}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Label>직접 색상 지정</Label>
                      <IconTip text='배경/전경 대비가 낮으면 스캔 실패 가능. 전경은 진하게, 배경은 밝게(또는 반대로)!' />
                    </div>

                    <div className='flex gap-4'>
                      <div className='flex-1 space-y-1'>
                        <span className='text-xs text-muted-foreground'>배경</span>
                        <div className='flex items-center gap-2'>
                          <Input
                            type='color'
                            value={options.bgColor}
                            onChange={e => updateOption('bgColor', e.target.value)}
                            className='h-9 w-full cursor-pointer p-1 transition-transform hover:scale-105'
                          />
                          <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                            <Square className='h-3.5 w-3.5' />
                            {options.bgColor}
                          </span>
                        </div>
                      </div>

                      <div className='flex-1 space-y-1'>
                        <span className='text-xs text-muted-foreground'>전경(QR)</span>
                        <div className='flex items-center gap-2'>
                          <Input
                            type='color'
                            value={options.fgColor}
                            onChange={e => updateOption('fgColor', e.target.value)}
                            className='h-9 w-full cursor-pointer p-1 transition-transform hover:scale-105'
                          />
                          <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                            <Square className='h-3.5 w-3.5' />
                            {options.fgColor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className='flex flex-wrap gap-3'>
                  <Button
                    onClick={onDownloadPng}
                    disabled={!canDownloadPng}
                    className='flex-1 gap-2 transition-all disabled:opacity-50'
                  >
                    {justDownloaded === 'png' ? (
                      <>
                        <Check className='h-4 w-4' />
                        저장 완료
                      </>
                    ) : (
                      <>
                        <Download className='h-4 w-4' />
                        PNG 저장
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={onDownloadSvg}
                    disabled={!canDownloadSvg}
                    variant='secondary'
                    className='flex-1 gap-2 transition-all disabled:opacity-50'
                  >
                    {justDownloaded === 'svg' ? (
                      <>
                        <Check className='h-4 w-4' />
                        저장 완료
                      </>
                    ) : (
                      <>
                        <Download className='h-4 w-4' />
                        SVG 저장
                      </>
                    )}
                  </Button>

                  <Button onClick={onReset} variant='outline' className='gap-2 transition-all'>
                    <RotateCcw className='h-4 w-4' />
                  </Button>
                </div>

                {error && !isTextTooLong ? (
                  <div className='rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive'>
                    {error}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview */}
          <div className='lg:col-span-5'>
            <Card className='sticky top-8 flex h-full flex-col justify-between overflow-hidden border border-border/50 p-0 shadow-xl'>
              <CardHeader className='m-0 flex flex-row items-center justify-between space-y-0 border-b bg-muted/40 px-6 py-4'>
                <div className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
                  Live Preview
                </div>

                {isBuilding ? (
                  <div className='flex items-center gap-2 text-xs font-medium text-primary'>
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                    생성 중...
                  </div>
                ) : (
                  <div className='flex items-center gap-1.5 text-xs text-muted-foreground/80'>
                    <div className={cn('h-2 w-2 rounded-full', status.dot)} />
                    {status.label}
                  </div>
                )}
              </CardHeader>

              <div className='relative flex aspect-square w-full items-center justify-center bg-muted/5 p-8 sm:p-12'>
                <div
                  className='absolute inset-0 opacity-[0.04]'
                  style={{
                    backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {pngDataUrl ? (
                  <div className='relative z-10 flex items-center justify-center rounded-xl bg-background p-4 shadow-sm ring-1 ring-black/5 transition-transform duration-300 hover:scale-[1.02]'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pngDataUrl}
                      alt='QR preview'
                      className='h-auto w-auto max-h-[320px] max-w-full'
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                ) : (
                  <div className='z-10 flex flex-col items-center justify-center space-y-3 text-center opacity-40'>
                    <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-muted shadow-inner'>
                      <QrCode className='h-10 w-10 text-muted-foreground' />
                    </div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      내용을 입력하면
                      <br />
                      여기에 나타납니다
                    </p>
                  </div>
                )}
              </div>

              <div className='border-t bg-muted/40 px-6 py-3'>
                <div className='flex items-center justify-between text-[11px] font-medium text-muted-foreground'>
                  <div className='flex items-center gap-2'>
                    <span className='rounded-full border bg-background px-2 py-0.5 shadow-sm'>
                      PNG
                    </span>
                    <span>Pixel-perfect</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <span>Size:</span>
                    <span className='font-mono text-foreground'>{QR_SIZE_MAP[options.size]}px</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
