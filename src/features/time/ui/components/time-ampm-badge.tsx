import { Clock3 } from 'lucide-react'

type Props = {
  meridiem: string
}

export default function TimeAmpmBadge({ meridiem }: Props) {
  return (
    <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md'>
      <Clock3 className='w-3 h-3' />
      {meridiem}
    </div>
  )
}
