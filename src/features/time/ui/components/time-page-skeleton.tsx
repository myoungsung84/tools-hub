import { Skeleton } from '@/components/ui/skeleton'

export default function TimePageSkeleton() {
  return (
    <div className='flex w-full flex-1 items-center justify-center px-4'>
      <div className='w-full max-w-[520px] space-y-4'>
        <Skeleton className='h-8 w-32 mx-auto' />
        <Skeleton className='h-36 w-full rounded-3xl' />
        <div className='grid grid-cols-4 gap-2'>
          <Skeleton className='h-20 rounded-xl' />
          <Skeleton className='h-20 rounded-xl' />
          <Skeleton className='h-20 rounded-xl' />
          <Skeleton className='h-20 rounded-xl' />
        </div>
      </div>
    </div>
  )
}
