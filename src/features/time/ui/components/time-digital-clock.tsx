type Props = {
  hh: string
  mm: string
  ss: string
}

export default function TimeDigitalClock({ hh, mm, ss }: Props) {
  return (
    <div className='flex flex-col items-center gap-6 font-mono tabular-nums leading-none'>
      <div className='flex items-baseline justify-center gap-1 sm:gap-3'>
        <span className='text-[clamp(64px,15vw,160px)] font-black tracking-tighter bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-2xl'>
          {hh}
        </span>
        <span className='animate-pulse text-[clamp(40px,10vw,100px)] font-light text-muted-foreground/30'>
          :
        </span>
        <span className='text-[clamp(64px,15vw,160px)] font-black tracking-tighter bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-2xl'>
          {mm}
        </span>
        <span className='animate-pulse text-[clamp(40px,10vw,100px)] font-light text-muted-foreground/30'>
          :
        </span>
        <span className='text-[clamp(64px,15vw,160px)] font-black tracking-tighter bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-2xl'>
          {ss}
        </span>
      </div>

      <div className='relative h-px w-full max-w-[600px]'>
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent' />
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent blur-sm' />
      </div>
    </div>
  )
}
