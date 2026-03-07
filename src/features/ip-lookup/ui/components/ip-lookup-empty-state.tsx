type Props = {
  message: string
}

export default function IpLookupEmptyState({ message }: Props) {
  return (
    <div className='flex h-full min-h-[64px] items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/10 px-4 py-3'>
      <p className='text-sm text-muted-foreground/50'>{message}</p>
    </div>
  )
}
