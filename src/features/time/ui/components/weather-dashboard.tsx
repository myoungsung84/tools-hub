import type { WeatherRegion } from '@/features/time/constants/weather-region.constants'
import type { WeatherNow } from '@/features/time/types/weather-now.types'

import { WeatherTalk } from './weather-talk'

type Props = {
  regionList: readonly WeatherRegion[]
  data: Partial<Record<WeatherRegion | 'CURRENT', WeatherNow>>
}

export default function WeatherDashboard({ regionList, data }: Props) {
  return (
    <div className='mt-10 w-full max-w-[940px] animate-in fade-in slide-in-from-bottom-6 duration-1000'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {regionList.map(r => (
          <div
            key={r}
            className='group relative overflow-hidden rounded-[22px]
                       border border-white/[0.05] bg-neutral-950/20
                       p-0 transition-all duration-500
                       sm:hover:border-white/20 sm:hover:bg-neutral-900/40
                       sm:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]
                       sm:hover:-translate-y-1.5'
          >
            <div className='absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/[0.02] group-hover:ring-white/[0.1] transition-all' />
            <WeatherTalk weather={data[r] ?? null} />
          </div>
        ))}
      </div>
    </div>
  )
}
