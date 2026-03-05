import { Loader2, QrCode } from 'lucide-react'

import { Card, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/client'

import type { QrOptions } from '../../lib/qr'
import { QR_SIZE_MAP } from '../../lib/qr'

type QrPreviewCardProps = {
  isBuilding: boolean
  pngDataUrl: string | null
  status: { label: string; dot: string }
  size: QrOptions['size']
}

export function QrPreviewCard(props: QrPreviewCardProps) {
  const { isBuilding, pngDataUrl, status, size } = props

  return (
    <Card className='sticky top-8 flex h-full flex-col justify-between overflow-hidden border border-border/50 p-0 shadow-xl'>
      <CardHeader className='m-0 flex flex-row items-center justify-between space-y-0 border-b bg-muted/40 px-6 py-4'>
        <div className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>Live Preview</div>

        {isBuilding ? (
          <div className='flex items-center gap-2 text-xs font-medium text-primary'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
            생성 중...
          </div>
        ) : (
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground/80'>
            <div className={cn('h-2 w-2 rounded-full', status.dot)} />
            {status.label}
          </div>
        )}
      </CardHeader>

      <div className='relative flex aspect-square w-full items-center justify-center bg-muted/5 p-8 sm:p-12'>
        <div
          className='absolute inset-0 opacity-[0.04]'
          style={{
            backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

        {pngDataUrl ? (
          <div className='relative z-10 flex items-center justify-center rounded-xl bg-background p-4 shadow-sm ring-1 ring-black/5 transition-transform duration-300 hover:scale-[1.02]'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pngDataUrl}
              alt='QR preview'
              className='h-auto w-auto max-h-[320px] max-w-full'
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        ) : (
          <div className='z-10 flex flex-col items-center justify-center space-y-3 text-center opacity-40'>
            <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-muted shadow-inner'>
              <QrCode className='h-10 w-10 text-muted-foreground' />
            </div>
            <p className='text-sm font-medium text-muted-foreground'>
              내용을 입력하면
              <br />
              여기에 나타납니다
            </p>
          </div>
        )}
      </div>

      <div className='border-t bg-muted/40 px-6 py-3'>
        <div className='flex items-center justify-between text-[11px] font-medium text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <span className='rounded-full border bg-background px-2 py-0.5 shadow-sm'>PNG</span>
            <span>Pixel-perfect</span>
          </div>
          <div className='flex items-center gap-1'>
            <span>Size:</span>
            <span className='font-mono text-foreground'>{QR_SIZE_MAP[size]}px</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
