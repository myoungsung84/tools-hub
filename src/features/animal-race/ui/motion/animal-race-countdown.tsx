'use client'

import { AnimatePresence, motion } from 'framer-motion'

type AnimalRaceCountdownProps = {
  value: number | null
}

export default function AnimalRaceCountdown({ value }: AnimalRaceCountdownProps) {
  return (
    <AnimatePresence>
      {value !== null && (
        <motion.div
          key={value}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.25 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/35 text-6xl font-black text-white/90 backdrop-blur-sm'
        >
          {value}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
