import { Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

export default function DecideHeader() {
  return (
    <section className='mx-auto w-full max-w-2xl space-y-4 text-center'>
      <div className='flex justify-center'>
        <Badge
          variant='secondary'
          className='gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground shadow-sm'
        >
          <Sparkles className='size-3.5 text-yellow-400' />
          오늘의 빠른 결정
        </Badge>
      </div>

      <div className='space-y-2'>
        <h2 className='text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>
          살까 말까, 빠르게 정리해주는 결정 도구
        </h2>
        <p className='mx-auto max-w-xl text-pretty text-xs leading-6 text-muted-foreground sm:text-sm'>
          구매나 선택이 애매할 때 룰렛으로 빠르게 결정을 도와주는 도구입니다.
        </p>
      </div>
    </section>
  )
}
