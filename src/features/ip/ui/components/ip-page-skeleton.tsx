import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  wrapClass: string
}

export default function IpPageSkeleton({ wrapClass }: Props) {
  return (
    <div className={`${wrapClass} max-w-[960px] space-y-5`}>
      <div className='mx-auto flex w-full max-w-[800px] flex-col items-center gap-2.5'>
        <Skeleton className='h-7 w-44 rounded-full' />
        <Skeleton className='h-[clamp(42px,6vw,70px)] w-full max-w-[640px] rounded-3xl' />
        <Skeleton className='h-6 w-14 rounded-md' />
        <Skeleton className='h-5 w-64 rounded-full' />
      </div>

      <div className='w-full max-w-[960px]'>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className='h-24 w-full rounded-2xl' />
          ))}
        </div>
        <Skeleton className='mt-3 h-20 w-full rounded-2xl' />
      </div>
    </div>
  )
}
