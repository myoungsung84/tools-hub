import { cn } from '@/lib/client'

import { UNKNOWN } from '../../lib/ip-lookup.constants'

type Props = {
  label: string
  value: string
}

export default function IpLookupResultRow({ label, value }: Props) {
  const isEmpty = value === UNKNOWN

  return (
    <div className='flex flex-col gap-1.5 rounded-lg border border-border/50 bg-muted/20 px-4 py-3'>
      <p className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60'>
        {label}
      </p>
      <p
        className={cn(
          'break-all text-sm font-medium leading-snug',
          isEmpty ? 'text-muted-foreground/40' : 'text-foreground'
        )}
      >
        {value}
      </p>
    </div>
  )
}
