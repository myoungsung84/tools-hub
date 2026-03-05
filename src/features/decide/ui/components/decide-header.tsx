import { motion } from 'framer-motion'
import { Dice5, Sparkles } from 'lucide-react'

export default function DecideHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-xs backdrop-blur-sm sm:px-4 sm:py-2 sm:text-sm text-muted-foreground'
    >
      <Dice5 className='h-3 w-3 sm:h-4 sm:w-4' />
      <span className='whitespace-nowrap'>살까 말까 결정 도우미</span>
      <Sparkles className='h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-500' />
    </motion.div>
  )
}
