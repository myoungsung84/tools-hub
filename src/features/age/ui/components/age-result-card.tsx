'use client'

import { AnimatePresence, motion, type Transition } from 'framer-motion'
import * as React from 'react'

import { cn } from '@/lib/client'

import { CardMotion, PresenceMotion } from '../motion/age-motion'

export default function AgeResultCard({
  layoutId,
  hasValues,
  cardMotion,
  spring,
  numberIn,
  className,
  skeleton,
  children,
}: {
  layoutId: string
  hasValues: boolean
  cardMotion: CardMotion
  spring: Transition
  numberIn: PresenceMotion
  className?: string
  skeleton: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <motion.div
      layoutId={layoutId}
      whileHover={hasValues ? cardMotion.whileHover : undefined}
      whileTap={hasValues ? cardMotion.whileTap : undefined}
      transition={cardMotion.transition}
      className={cn(
        'relative rounded-xl border border-border/60 p-6 will-change-transform',
        className
      )}
    >
      {/* skeleton */}
      <div
        className={cn('transition-opacity duration-300', hasValues ? 'opacity-0' : 'opacity-100')}
      >
        {skeleton}
      </div>

      {/* value */}
      <AnimatePresence initial={false}>
        {hasValues && (
          <motion.div
            initial={numberIn.initial}
            animate={numberIn.animate}
            exit={numberIn.exit}
            transition={spring}
            className='absolute inset-0 p-6'
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
