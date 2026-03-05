import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/client'

type Props = {
  isSpinning: boolean
  isDone: boolean
  onSpin: () => void
}

export default function DecideSpinButton({ isSpinning, isDone, onSpin }: Props) {
  return (
    <motion.div
      className='w-full max-w-md px-4 sm:px-0'
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        size='lg'
        onClick={onSpin}
        disabled={isSpinning}
        className={cn(
          'relative w-full overflow-hidden rounded-xl text-sm font-semibold sm:text-base',
          'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600',
          'text-white shadow-lg',
          'hover:from-purple-500 hover:via-pink-500 hover:to-blue-500',
          'hover:shadow-xl hover:shadow-purple-500/25',
          'active:scale-[0.97]',
          'transition-all duration-200',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg',
          'h-12 sm:h-14'
        )}
      >
        {isSpinning && (
          <motion.div
            className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
        )}
        <span className='relative z-10'>
          {isSpinning ? '🌀 결정 중…' : isDone ? '🎲 다시 돌리기' : '✨ 운명에 맡기기'}
        </span>
      </Button>
    </motion.div>
  )
}
