'use client'

import { ChevronDown, Dice6 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/client'

type AnimalRaceControlsProps = {
  participantCount: number
  allowDuplicates: boolean
  sabotageEnabled: boolean
  isRacing: boolean
  isCollapsed: boolean
  onToggleCollapsed: () => void
  onCountChange: (value: number) => void
  onShuffleAnimals: () => void
  onAllowDuplicatesChange: (value: boolean) => void
  onSabotageChange: (value: boolean) => void
  onStart: () => void
  onReset: () => void
}

export default function AnimalRaceControls({
  participantCount,
  allowDuplicates,
  sabotageEnabled,
  isRacing,
  isCollapsed,
  onToggleCollapsed,
  onCountChange,
  onShuffleAnimals,
  onAllowDuplicatesChange,
  onSabotageChange,
  onStart,
  onReset,
}: AnimalRaceControlsProps) {
  return (
    <section className='rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm md:sticky md:top-4'>
      <button
        type='button'
        onClick={onToggleCollapsed}
        className='flex w-full items-center justify-between text-left md:pointer-events-none'
      >
        <div>
          <p className='text-sm text-white/70 md:hidden'>모바일 단계형 설정</p>
          <h2 className='text-lg font-semibold text-white'>레이스 설정</h2>
        </div>
        <ChevronDown
          className={cn('h-5 w-5 text-white/70 transition-transform md:hidden', isCollapsed && '-rotate-90')}
        />
      </button>

      <div className={cn('mt-4 space-y-4', isCollapsed ? 'hidden md:block' : 'block')}>
        <div className='space-y-2'>
          <p className='text-sm font-medium text-white/80'>1) 인원 설정</p>
          <input
            type='range'
            min={2}
            max={12}
            value={participantCount}
            onChange={(event) => onCountChange(Number(event.target.value))}
            disabled={isRacing}
            className='w-full accent-white'
          />
          <p className='text-sm text-white/70'>{participantCount}명</p>
        </div>

        <div className='space-y-2'>
          <p className='text-sm font-medium text-white/80'>2) 자동 배정</p>
          <Button type='button' onClick={onShuffleAnimals} disabled={isRacing} className='w-full gap-2'>
            <Dice6 className='h-4 w-4' />
            랜덤 동물 자동 배정
          </Button>
        </div>

        <div className='space-y-3 rounded-xl border border-white/10 bg-white/5 p-3'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-white/80'>중복 허용</p>
            <Switch checked={allowDuplicates} onCheckedChange={onAllowDuplicatesChange} disabled={isRacing} />
          </div>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-white/80'>방해요소 연출(MVP)</p>
            <Switch checked={sabotageEnabled} onCheckedChange={onSabotageChange} disabled={isRacing} />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button type='button' onClick={onStart} disabled={isRacing}>
            Start
          </Button>
          <Button type='button' onClick={onReset} variant='secondary'>
            Reset
          </Button>
        </div>
      </div>
    </section>
  )
}
