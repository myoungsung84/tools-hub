import { ExternalLink, Map } from 'lucide-react'

import { buildOsmEmbedUrl, buildOsmLinkUrl } from '@/features/ip/lib/ip-map'

type Props = {
  latitude: number
  longitude: number
}

export default function IpMapCard({ latitude, longitude }: Props) {
  const embedUrl = buildOsmEmbedUrl(latitude, longitude)
  const linkUrl = buildOsmLinkUrl(latitude, longitude)

  return (
    <div className='sm:col-span-2 group relative overflow-hidden rounded-2xl border bg-neutral-900/40 transition-all hover:border-white/20 hover:bg-neutral-900/60'>
      <div className='flex items-center justify-between px-5 py-4'>
        <div className='flex items-center gap-2'>
          <div className='p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors'>
            <Map className='w-4 h-4 text-cyan-400' />
          </div>
          <span className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
            Location Map
          </span>
        </div>
        <a
          href={linkUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors'
        >
          <ExternalLink className='w-3 h-3' />
          OpenStreetMap에서 보기
        </a>
      </div>
      <iframe
        src={embedUrl}
        title='IP 위치 지도'
        width='100%'
        height='240'
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
        className='w-full border-t border-white/5'
      />
    </div>
  )
}
