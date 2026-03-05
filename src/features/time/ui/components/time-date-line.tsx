import { CalendarDays } from 'lucide-react'

type Props = {
  dateLine: string
}

export default function TimeDateLine({ dateLine }: Props) {
  return (
    <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground/80 sm:text-base'>
      <CalendarDays className='w-4 h-4' />
      {dateLine}
    </div>
  )
}
