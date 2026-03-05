import { Check, Download, Palette, RotateCcw, Square } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { cn } from '@/lib/client'

import type { QrOptions, QrSize } from '../../lib/qr'
import { COLOR_PRESETS } from '../../lib/qr'
import { IconTip } from './icon-tip'

type UpdateOption = <K extends keyof QrOptions>(key: K, value: QrOptions[K]) => void

type QrDesignCardProps = {
  options: QrOptions
  updateOption: UpdateOption
  applyPreset: (fg: string, bg: string) => void
  onDownloadPng: () => void | Promise<void>
  onDownloadSvg: () => void | Promise<void>
  onReset: () => void
  canDownloadPng: boolean
  canDownloadSvg: boolean
  justDownloaded: 'png' | 'svg' | null
  error: string | null
  isTextTooLong: boolean
}

export function QrDesignCard(props: QrDesignCardProps) {
  const {
    options,
    updateOption,
    applyPreset,
    onDownloadPng,
    onDownloadSvg,
    onReset,
    canDownloadPng,
    canDownloadSvg,
    justDownloaded,
    error,
    isTextTooLong,
  } = props

  return (
    <Card>
      <CardHeader>
        <CardTitle>디자인 설정</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
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
                    <Check className='h-2.5 w-2.5 text-primary-foreground' strokeWidth={3} />
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
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <Label>해상도 (Size)</Label>
              <IconTip text='QR 출력 크기(px). 인쇄/고해상도면 L~XL 추천.' />
            </div>
            <Select value={options.size} onValueChange={v => updateOption('size', v as QrSize)}>
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
            <div className='text-xs text-muted-foreground'>권장: 1~2 (스캐너가 테두리를 좋아함)</div>
          </div>

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
  )
}
