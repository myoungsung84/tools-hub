import { cn } from '@/lib/client'

type UnitConverterResultItem = {
  id: string
  label: string
  symbol: string
  value: number
}

type UnitConverterResultListProps = {
  items: UnitConverterResultItem[]
  fromUnitId: string
  formatValue: (value: number) => string
}

export default function UnitConverterResultList({
  items,
  fromUnitId,
  formatValue,
}: UnitConverterResultListProps) {
  return (
    <ul className='grid grid-cols-1 gap-2 sm:grid-cols-2' data-testid='unit-converter-results'>
      {items.map((item, i) => {
        const isBase = item.id === fromUnitId

        return (
          <li
            key={item.id}
            data-testid={`unit-result-${item.id}`}
            style={{ animationDelay: `${i * 40}ms` }}
            className={cn(
              'group relative flex items-center justify-between overflow-hidden rounded-lg border px-5 py-4 text-sm',
              'animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both',
              isBase
                ? 'border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-sm shadow-primary/10'
                : 'border-border/60 bg-gradient-to-br from-muted/40 to-transparent hover:border-border hover:from-muted/60'
            )}
          >
            <span className='flex flex-col gap-0.5'>
              <span
                className={cn('font-medium', isBase ? 'text-foreground' : 'text-muted-foreground')}
              >
                {item.label}
              </span>
              <span className='font-mono text-xs text-muted-foreground/50'>{item.symbol}</span>
            </span>

            <strong
              className={cn(
                'font-mono text-lg font-bold tabular-nums tracking-tight',
                isBase ? 'text-primary' : 'text-foreground'
              )}
            >
              {formatValue(item.value)}
              <span className='ml-1 font-sans text-xs font-normal text-muted-foreground'>
                {item.symbol}
              </span>
            </strong>
          </li>
        )
      })}
    </ul>
  )
}
