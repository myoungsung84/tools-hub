'use client'

import { debounce, isNil } from 'lodash-es'
import { ClipboardPaste, Eraser, Type } from 'lucide-react'
import * as React from 'react'

import PageHeader from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/client'
import { formatNumber } from '@/lib/shared'

import { calcTextCount } from '../lib/text-count'
import TextCountStats from './text-count-stats'

type Mode = 'all' | 'selection'

export default function TextCountPage() {
  const [text, setText] = React.useState('')
  const [mode, setMode] = React.useState<Mode>('all')
  const [selection, setSelection] = React.useState<{ from: number; to: number } | null>(null)

  const [result, setResult] = React.useState(() => calcTextCount('', null))

  const textRef = React.useRef<HTMLTextAreaElement | null>(null)

  const recompute = React.useMemo(
    () =>
      debounce((nextText: string, nextSel: { from: number; to: number } | null, nextMode: Mode) => {
        const sel = nextMode === 'selection' ? nextSel : null
        setResult(calcTextCount(nextText, sel))
      }, 120),
    []
  )

  React.useEffect(() => {
    recompute(text, selection, mode)
    return () => {
      recompute.cancel()
    }
  }, [text, selection, mode, recompute])

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const syncSelection = () => {
    const el = textRef.current
    if (!el) return
    setSelection({ from: el.selectionStart ?? 0, to: el.selectionEnd ?? 0 })
  }

  const onClear = () => {
    setText('')
    setSelection(null)
    setMode('all')
    requestAnimationFrame(() => {
      textRef.current?.focus()
    })
  }

  const onPasteFromClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText()
      if (clip.trim() === '') return

      setText(clip)
      setSelection(null)
      setMode('all')

      requestAnimationFrame(() => {
        textRef.current?.focus()
        // 커서 끝으로
        const el = textRef.current
        if (!el) return
        const end = clip.length
        el.setSelectionRange(end, end)
      })
    } catch {
      // 권한/브라우저 정책으로 실패할 수 있음 (noop)
    }
  }

  const showSelection = mode === 'selection' && !isNil(result.selection)

  const stats = showSelection
    ? {
        title: '선택 영역',
        hint: `${formatNumber(result.selection!.from)}–${formatNumber(result.selection!.to)}`,
        count: {
          charsWithSpaces: result.selection!.charsWithSpaces,
          charsNoSpaces: result.selection!.charsNoSpaces,
          words: result.selection!.words,
          lines: result.selection!.lines,
          bytesUtf8: result.selection!.bytesUtf8,
        },
      }
    : {
        title: '전체',
        hint: undefined,
        count: {
          charsWithSpaces: result.charsWithSpaces,
          charsNoSpaces: result.charsNoSpaces,
          words: result.words,
          lines: result.lines,
          bytesUtf8: result.bytesUtf8,
        },
      }

  const selectionEnabled = mode === 'selection'
  const selectionActive =
    showSelection && (result.selection?.from ?? 0) !== (result.selection?.to ?? 0)

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        icon={Type}
        kicker='글자수 세기'
        title='텍스트를 쉽고 빠르게 분석하세요'
        description='입력한 텍스트의 글자 수, 단어 수, 줄 수, 바이트 수를 즉시 계산합니다.'
      />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch'>
        {/* left */}
        <Card className='h-full w-full border-zinc-800 bg-zinc-900/50'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-zinc-100'>입력</CardTitle>
            <CardDescription className='text-zinc-400'>
              텍스트를 붙여넣고 드래그하면{' '}
              <span className='font-medium text-zinc-300'>선택한 부분만</span> 따로 카운트할 수도
              있어요.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-1 flex-col gap-4'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <Switch
                  id='mode-selection'
                  checked={selectionEnabled}
                  onCheckedChange={checked => setMode(checked ? 'selection' : 'all')}
                />
                <Label
                  htmlFor='mode-selection'
                  className='cursor-pointer select-none text-zinc-200'
                >
                  선택 영역 기준
                </Label>

                {selectionEnabled ? (
                  <span
                    className={cn('text-xs', selectionActive ? 'text-blue-400' : 'text-zinc-500')}
                  >
                    {selectionActive ? '선택됨' : '선택 없음'}
                  </span>
                ) : null}
              </div>

              <div className='flex items-center gap-2'>
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={onPasteFromClipboard}
                  className='h-9 gap-2 border-zinc-700 bg-zinc-800 px-3 text-zinc-100 hover:bg-zinc-700'
                >
                  <ClipboardPaste className='h-4 w-4' />
                  붙여넣기
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={onClear}
                  className='h-9 gap-2 border-zinc-700 px-3 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
                >
                  <Eraser className='h-4 w-4' />
                  비우기
                </Button>
              </div>
            </div>

            <Textarea
              ref={textRef}
              value={text}
              onChange={onChange}
              onSelect={syncSelection}
              onKeyUp={syncSelection}
              onMouseUp={syncSelection}
              placeholder='여기에 텍스트를 입력하거나 붙여넣으세요…'
              className={cn(
                'flex-1 h-full resize-none overflow-y-auto max-h-[320px]',
                'font-mono tabular-nums',
                'bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-600',
                'focus-visible:ring-zinc-500/20 focus-visible:border-zinc-600'
              )}
            />

            {selectionEnabled ? (
              <p className='text-xs text-zinc-500'>
                * 선택 영역이 없으면 자동으로{' '}
                <span className='font-medium text-zinc-300'>전체</span> 값이 표시됩니다.
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* right */}
        <div className='flex h-full flex-col gap-6'>
          <div className='shrink-0'>
            <TextCountStats title={stats.title} hint={stats.hint} count={stats.count} />
          </div>

          <Card className='flex flex-1 flex-col border-zinc-800 bg-zinc-900/50'>
            <CardHeader className='space-y-1'>
              <CardTitle className='text-zinc-100'>팁</CardTitle>
              <CardDescription className='text-zinc-400'>
                {`자주 쓰는 기준은 "프리셋"으로 묶어두면 더 편해져요.`}
              </CardDescription>
            </CardHeader>
            <CardContent className='flex-1 text-sm text-zinc-400'>
              <ul className='list-disc space-y-1.5 pl-5'>
                <li>
                  자소서/지원서:{' '}
                  <span className='font-medium text-zinc-200'>현재 X자 / 제한 Y자</span> 표시
                </li>
                <li>
                  SNS: 트위터(X) <span className='font-medium text-zinc-200'>280자</span> 같은 제한
                  관리
                </li>
                <li>
                  바이트: 문자(SMS/LMS)처럼{' '}
                  <span className='font-medium text-zinc-200'>용량 제한</span> 계산에 유용
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
