import { AlertCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/client'

type QrInputCardProps = {
  text: string
  onTextChange: (value: string) => void
  textLength: number
  maxTextLength: number
  isTextTooLong: boolean
  shouldShowWarning: boolean
}

export function QrInputCard(props: QrInputCardProps) {
  const {
    text,
    onTextChange,
    textLength,
    maxTextLength,
    isTextTooLong,
    shouldShowWarning,
  } = props

  return (
    <Card>
      <CardHeader>
        <CardTitle>내용 입력</CardTitle>
        <CardDescription>QR 코드로 변환할 정보를 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={text}
          onChange={e => onTextChange(e.target.value)}
          placeholder='https://example.com'
          aria-label='QR 내용 입력'
          data-testid='qr-text-input'
          className={cn(
            'min-h-[120px] resize-none text-base transition-shadow focus-visible:shadow-sm',
            isTextTooLong && 'border-destructive focus-visible:ring-destructive'
          )}
        />

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
            {textLength.toLocaleString()} / {maxTextLength.toLocaleString()}자
          </div>
        </div>

        {shouldShowWarning && (
          <div className='mt-3 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200'>
            <AlertCircle className='h-4 w-4 flex-shrink-0 mt-0.5' />
            <div>
              <div className='font-medium'>텍스트가 깁니다</div>
              <div className='text-xs mt-1'>
                {maxTextLength - textLength}자 남았습니다. QR 코드가 복잡해져 스캔이 어려울 수
                있어요.
              </div>
            </div>
          </div>
        )}

        {isTextTooLong && (
          <div className='mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive'>
            <AlertCircle className='h-4 w-4 flex-shrink-0 mt-0.5' />
            <div>
              <div className='font-medium'>최대 길이 초과</div>
              <div className='text-xs mt-1'>
                텍스트를 {(textLength - maxTextLength).toLocaleString()}자 줄여주세요.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
