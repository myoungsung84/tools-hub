'use client'

import { debounce, isNil } from 'lodash-es'
import { Type } from 'lucide-react'
import * as React from 'react'

import PageHeader from '@/components/layout/page-header'
import { cn } from '@/lib/client'
import { formatNumber } from '@/lib/shared'

import { calcTextCount } from '../lib/text-count'
import TextCountStats from './components/text-count-stats'
import TextInputCard from './components/text-input-card'
import TextTipsCard from './components/text-tips-card'

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
    <div className={cn('w-full')}>
      <PageHeader
        icon={Type}
        kicker='글자수 세기'
        title='텍스트를 쉽고 빠르게 분석하세요'
        description='입력한 텍스트의 글자 수, 단어 수, 줄 수, 바이트 수를 즉시 계산합니다.'
      />
      <div className='flex w-full flex-col'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch'>
          <TextInputCard
            text={text}
            textRef={textRef}
            selectionEnabled={selectionEnabled}
            selectionActive={selectionActive}
            onToggleSelection={checked => setMode(checked ? 'selection' : 'all')}
            onPasteFromClipboard={onPasteFromClipboard}
            onClear={onClear}
            onChange={onChange}
            syncSelection={syncSelection}
          />

          <div className='flex h-full flex-col gap-6'>
            <div className='shrink-0'>
              <TextCountStats title={stats.title} hint={stats.hint} count={stats.count} />
            </div>

            <TextTipsCard />
          </div>
        </div>
      </div>
    </div>
  )
}
