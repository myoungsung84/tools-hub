import { motion } from 'framer-motion'

import { CHOICE_ORDER, CHOICES } from '../../lib/decide.data'

export default function DecideLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className='mt-2 grid w-full max-w-3xl grid-cols-2 gap-1.5 px-4 text-xs text-muted-foreground sm:grid-cols-3 sm:gap-2 sm:px-0 lg:grid-cols-4'
    >
      {CHOICE_ORDER.map(choice => (
        <div
          key={choice}
          className='flex items-center justify-center gap-1 rounded-lg bg-muted/30 px-2 py-1.5 backdrop-blur-sm sm:gap-1.5'
        >
          <span className='text-xs sm:text-sm'>{CHOICES[choice].emoji}</span>
          <span className='truncate text-[10px] sm:text-xs'>{CHOICES[choice].label}</span>
        </div>
      ))}
    </motion.div>
  )
}
