import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  wrapClass: string
}

export default function IpPageSkeleton({ wrapClass }: Props) {
  return (
    <div className={wrapClass}>
      <div className='w-full max-w-[640px] space-y-6'>
        <Skeleton className='mx-auto h-12 w-64 rounded-2xl' />
        <Skeleton className='mx-auto h-24 w-full rounded-3xl' />
        <div className='grid gap-4 sm:grid-cols-2 mt-8'>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className='h-32 w-full rounded-2xl' />
          ))}
        </div>
      </div>
    </div>
  )
}
