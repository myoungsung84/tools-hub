import { motion } from 'framer-motion'

import { cn } from '@/lib/client'

type Props = {
  emoji: string
  headline: string
  message: string
  toneClass: string
}

export default function DecideResult({ emoji, headline, message, toneClass }: Props) {
  return (
    <motion.div
      data-testid='decide-result'
      className='flex flex-col items-center gap-2 sm:gap-3'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        key={emoji}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className='text-5xl drop-shadow-lg sm:text-6xl md:text-7xl'
      >
        {emoji}
      </motion.div>

      <motion.div
        key={headline}
        data-testid='decide-headline'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          'font-bold tracking-tight drop-shadow-sm',
          'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
          toneClass
        )}
      >
        {headline}
      </motion.div>

      <motion.div
        key={message}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className='max-w-[56ch] px-4 text-sm text-muted-foreground sm:px-0 sm:text-base md:text-lg'
      >
        {message}
      </motion.div>
    </motion.div>
  )
}
