import { Skeleton } from '@/components/ui/skeleton'

export default function TimePageSkeleton() {
  return (
    <div className='flex w-full flex-1 items-center justify-center px-4'>
      <div className='w-full max-w-6xl space-y-8'>
        <Skeleton className='mx-auto h-8 w-28 rounded-full' />
        <Skeleton className='mx-auto h-32 w-full max-w-[640px] rounded-3xl' />
        <Skeleton className='mx-auto h-6 w-60' />

        <div className='flex flex-wrap justify-center gap-3'>
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className='min-w-[130px] rounded-2xl border border-white/8 bg-white/5 px-6 py-4'
            >
              <div className='flex items-center justify-between gap-3'>
                <Skeleton className='h-3 w-10' />
                <Skeleton className='h-3 w-16' />
              </div>
              <div className='mt-2 flex items-end gap-2'>
                <Skeleton className='h-8 w-16' />
                <Skeleton className='h-3 w-6' />
              </div>
              <div className='mt-2'>
                <Skeleton className='h-3 w-12' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
