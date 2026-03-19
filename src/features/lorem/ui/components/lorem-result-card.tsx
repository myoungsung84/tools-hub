import { Copy, RotateCcw, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

import type { LoremOutputStats } from '../../lib/types'

type LoremResultCardProps = {
  output: string
  stats: LoremOutputStats
  numberFormatter: Intl.NumberFormat
  onRefresh: () => void
  onCopy: () => void
}

export default function LoremResultCard({
  output,
  stats,
  numberFormatter,
  onRefresh,
  onCopy,
}: LoremResultCardProps) {
  return (
    <Card className='overflow-hidden border-primary/20'>
      <CardHeader className='flex flex-row items-center justify-between pb-3'>
        <CardTitle className='flex items-center gap-2'>
          <Sparkles className='text-primary h-4 w-4' />
          생성 결과
        </CardTitle>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={onRefresh}>
            <RotateCcw className='h-3.5 w-3.5' />
            새로 생성
          </Button>
          <Button size='sm' onClick={onCopy}>
            <Copy className='h-3.5 w-3.5' />
            복사
          </Button>
        </div>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <div className='grid grid-cols-3 gap-2'>
          <div className='rounded-md border bg-muted/30 px-3 py-2'>
            <p className='text-muted-foreground text-xs'>글자 수</p>
            <p className='text-base font-semibold'>{numberFormatter.format(stats.chars)}</p>
          </div>
          <div className='rounded-md border bg-muted/30 px-3 py-2'>
            <p className='text-muted-foreground text-xs'>단어 수</p>
            <p className='text-base font-semibold'>{numberFormatter.format(stats.words)}</p>
          </div>
          <div className='rounded-md border bg-muted/30 px-3 py-2'>
            <p className='text-muted-foreground text-xs'>유효 라인</p>
            <p className='text-base font-semibold'>{numberFormatter.format(stats.lines)}</p>
          </div>
        </div>

        <Textarea
          value={output}
          readOnly
          aria-label='생성된 더미 텍스트'
          data-testid='lorem-output'
          className='min-h-[340px] resize-y bg-muted/20 font-mono text-sm leading-7'
        />
      </CardContent>
    </Card>
  )
}
