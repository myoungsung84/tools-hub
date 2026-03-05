import { ClipboardPaste, Eraser } from 'lucide-react'
import type { ChangeEvent, RefObject } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/client'

type Props = {
  text: string
  textRef: RefObject<HTMLTextAreaElement | null>
  selectionEnabled: boolean
  selectionActive: boolean
  onToggleSelection: (checked: boolean) => void
  onPasteFromClipboard: () => void | Promise<void>
  onClear: () => void
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  syncSelection: () => void
}

export default function TextInputCard({
  text,
  textRef,
  selectionEnabled,
  selectionActive,
  onToggleSelection,
  onPasteFromClipboard,
  onClear,
  onChange,
  syncSelection,
}: Props) {
  return (
    <Card className='h-full w-full border-zinc-800 bg-zinc-900/50'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-zinc-100'>입력</CardTitle>
        <CardDescription className='text-zinc-400'>
          텍스트를 붙여넣고 드래그하면 <span className='font-medium text-zinc-300'>선택한 부분만</span>{' '}
          따로 카운트할 수도 있어요.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col gap-4'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <Switch id='mode-selection' checked={selectionEnabled} onCheckedChange={onToggleSelection} />
            <Label htmlFor='mode-selection' className='cursor-pointer select-none text-zinc-200'>
              선택 영역 기준
            </Label>

            {selectionEnabled ? (
              <span className={cn('text-xs', selectionActive ? 'text-blue-400' : 'text-zinc-500')}>
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
            * 선택 영역이 없으면 자동으로 <span className='font-medium text-zinc-300'>전체</span>{' '}
            값이 표시됩니다.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
