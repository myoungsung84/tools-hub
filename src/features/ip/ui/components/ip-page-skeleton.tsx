import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  wrapClass: string
}

export default function IpPageSkeleton({ wrapClass }: Props) {
  return (
    <div className={`${wrapClass} flex flex-col items-center gap-8`}>
      <div className='flex w-full max-w-[800px] flex-col items-center gap-4'>
        <Skeleton className='h-7 w-44 rounded-full' />
        <Skeleton className='h-[clamp(48px,8vw,88px)] w-full max-w-[640px] rounded-3xl' />
        <Skeleton className='h-6 w-14 rounded-md' />
        <Skeleton className='h-5 w-64 rounded-full' />
      </div>

      <div className='w-full max-w-[800px]'>
        <div className='grid gap-4 sm:grid-cols-2'>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className='h-32 w-full rounded-2xl' />
          ))}
        </div>
      </div>
    </div>
  )
}
