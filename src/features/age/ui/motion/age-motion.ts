import type { HTMLMotionProps, MotionProps, Transition } from 'framer-motion'

export type CardMotion = {
  whileHover?: HTMLMotionProps<'div'>['whileHover']
  whileTap?: HTMLMotionProps<'div'>['whileTap']
  transition: Transition
}

export type PresenceMotion = {
  initial?: MotionProps['initial']
  animate?: MotionProps['animate']
  exit?: MotionProps['exit']
}

export function buildCardMotion(reduceMotion: boolean, spring: Transition): CardMotion {
  if (reduceMotion) {
    return {
      whileHover: undefined,
      whileTap: undefined,
      transition: { duration: 0 },
    }
  }
  return {
    whileHover: { y: -2 },
    whileTap: { y: 0 },
    transition: spring,
  }
}

export function buildFade(): PresenceMotion {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }
}

export function buildNumberIn(reduceMotion: boolean): PresenceMotion {
  if (reduceMotion) return {}
  return {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  }
}
