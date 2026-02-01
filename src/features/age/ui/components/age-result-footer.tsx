'use client'

import { AnimatePresence, motion, type Transition } from 'framer-motion'

import { cn } from '@/lib/client'

import type { ZodiacBasis } from '../../lib/schema/age.schema'
import { PresenceMotion } from '../motion/age-motion'

export default function AgeResultFooter({
  showError,
  showEmpty,
  errorText,
  birth,
  asOf,
  zodiacBasis,
  spring,
  fade,
}: {
  showError: boolean
  showEmpty: boolean
  errorText: string | null
  birth: string
  asOf: string
  zodiacBasis: ZodiacBasis
  spring: Transition
  fade: PresenceMotion
}) {
  return (
    <AnimatePresence mode='wait' initial={false}>
      {showError ? (
        <motion.div
          key='error'
          layout
          initial={fade.initial}
          animate={fade.animate}
          exit={fade.exit}
          transition={spring}
          className={cn(
            'min-h-[72px] rounded-lg border px-5 py-4 text-sm leading-snug flex items-center',
            'border-rose-500/30 bg-rose-500/10'
          )}
        >
          <div className='w-full text-muted-foreground'>
            <div className='font-semibold text-rose-200'>⚠️ 입력 오류</div>
            <div className='mt-1 text-rose-200/90'>{errorText}</div>
          </div>
        </motion.div>
      ) : showEmpty ? (
        <motion.div
          key='empty'
          layout
          initial={fade.initial}
          animate={fade.animate}
          exit={fade.exit}
          transition={spring}
          className={cn(
            'min-h-[72px] rounded-lg border px-5 py-4 text-sm leading-snug flex items-center',
            'border-dashed border-border/70 bg-muted/20'
          )}
        >
          <div className='w-full text-muted-foreground'>
            생년월일을 입력하시면 만 나이, 세는나이, 띠, 별자리, 간지를 모두 보여드려요.
          </div>
        </motion.div>
      ) : (
        <motion.div
          key='info'
          layout
          initial={fade.initial}
          animate={fade.animate}
          exit={fade.exit}
          transition={spring}
          className={cn(
            'min-h-[72px] rounded-lg border px-5 py-4 text-sm leading-snug flex items-center',
            'border-border/60 bg-muted/20'
          )}
        >
          <div className='w-full text-muted-foreground'>
            <span className='font-medium text-foreground/80'>입력 정보</span> · 생년월일: {birth} ·
            기준일: {asOf} · 띠 계산:{' '}
            {zodiacBasis === 'ipchun' ? '입춘' : zodiacBasis === 'seollal' ? '설날' : '출생년도'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
