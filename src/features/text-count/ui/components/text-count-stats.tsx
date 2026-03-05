import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatNumber } from '@/lib/shared'

type StatRowProps = {
  label: string
  value: number | string
  sub?: string
}

function StatRow({ label, value, sub }: StatRowProps) {
  return (
    <div className='flex items-baseline justify-between gap-4'>
      <div className='text-sm text-muted-foreground'>
        {label}
        {sub ? <span className='ml-2 text-xs text-muted-foreground/70'>{sub}</span> : null}
      </div>

      {/* ✅ 여기서만 포맷 */}
      <div className='font-mono tabular-nums text-base font-semibold'>{formatNumber(value)}</div>
    </div>
  )
}

export default function TextCountStats({
  title,
  count,
  hint,
}: {
  title: string
  hint?: string
  count: {
    charsWithSpaces: number
    charsNoSpaces: number
    words: number
    lines: number
    bytesUtf8: number
  }
}) {
  return (
    <Card className='w-full'>
      <CardHeader className='space-y-1'>
        <CardTitle className='flex items-center gap-2'>
          <span>{title}</span>
          {hint ? <Badge variant='secondary'>{hint}</Badge> : null}
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-4'>
        <StatRow label='글자 수' value={count.charsWithSpaces} sub='공백 포함' />
        <StatRow label='글자 수' value={count.charsNoSpaces} sub='공백 제외' />
        <Separator />
        <StatRow label='단어 수' value={count.words} />
        <StatRow label='줄 수' value={count.lines} />
        <Separator />
        <StatRow label='바이트' value={count.bytesUtf8} sub='UTF-8' />
      </CardContent>
    </Card>
  )
}
