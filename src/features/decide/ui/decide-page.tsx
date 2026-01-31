'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { clamp } from 'lodash-es'
import { Dice5, Sparkles } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/client'

import type { ResultState } from '../lib/decide.data'
import { CHOICE_ORDER, CHOICES, STATE_UI } from '../lib/decide.data'
import { choiceFromRotation, pickTargetDelta, SPIN_MS } from '../lib/decide.math'
import { wedgePath } from '../lib/decide.svg'
import DecideConfetti from './decide-confetti'

export default function DecidePage() {
  const [rotation, setRotation] = React.useState(0)
  const [result, setResult] = React.useState<ResultState>({ status: 'idle' })
  const [showConfetti, setShowConfetti] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const rotationRef = React.useRef(0)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isSpinning = result.status === 'spinning'
  const isDone = result.status === 'done'

  const onSpin = () => {
    if (isSpinning) return
    setShowConfetti(false)

    const turns = Math.floor(clamp(6 + Math.random() * 4, 6, 10))
    const delta = pickTargetDelta(rotationRef.current)
    const next = rotationRef.current + turns * 360 + delta

    rotationRef.current = next
    setRotation(next)
    setResult({ status: 'spinning' })

    setTimeout(() => {
      const choice = choiceFromRotation(rotationRef.current)
      setResult({
        status: 'done',
        choice,
        message: CHOICES[choice].message,
        emoji: CHOICES[choice].emoji,
      })
      setShowConfetti(true)
    }, SPIN_MS)
  }

  const headline = isDone
    ? CHOICES[result.choice].label
    : result.status === 'spinning'
      ? STATE_UI.spinning.headline
      : STATE_UI.idle.headline

  const emoji = isDone
    ? result.emoji
    : result.status === 'spinning'
      ? STATE_UI.spinning.emoji
      : STATE_UI.idle.emoji

  const message =
    result.status === 'done'
      ? result.message
      : result.status === 'spinning'
        ? STATE_UI.spinning.message
        : STATE_UI.idle.message

  const tone = isDone ? CHOICES[result.choice].textColor : 'text-foreground'

  if (!mounted) {
    return (
      <div className='flex flex-col items-center justify-center'>
        <div className='text-muted-foreground'>로딩 중...</div>
      </div>
    )
  }

  return (
    <div className='relative w-full flex flex-col items-center justify-center gap-6 text-center sm:gap-8 sm:py-12'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-xs backdrop-blur-sm sm:px-4 sm:py-2 sm:text-sm text-muted-foreground'
      >
        <Dice5 className='h-3 w-3 sm:h-4 sm:w-4' />
        <span className='whitespace-nowrap'>살까 말까 결정 도우미</span>
        <Sparkles className='h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-500' />
      </motion.div>

      {/* Wheel Container */}
      <div className='relative w-full max-w-[440px]'>
        {/* Glow effect */}
        <div className='absolute inset-0 -z-10 animate-pulse rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl' />

        {/* Pointer */}
        <motion.svg
          className='absolute left-1/2 top-[-8px] z-10 -translate-x-1/2 drop-shadow-lg sm:top-[-12px]'
          width='24'
          height='18'
          viewBox='0 0 32 24'
          fill='currentColor'
          animate={isSpinning ? { y: [0, -4, 0] } : {}}
          transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.5 }}
        >
          <polygon points='16,24 0,0 32,0' className='text-foreground' />
        </motion.svg>

        {/* Wheel */}
        <motion.div
          className='relative aspect-square w-full overflow-hidden rounded-full border-2 border-border/60 shadow-2xl sm:border-4'
          style={{
            boxShadow: '0 0 60px rgba(0,0,0,0.3), inset 0 0 30px rgba(255,255,255,0.05)',
          }}
          animate={{ rotate: rotation }}
          transition={{ duration: SPIN_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg viewBox='0 0 100 100' className='h-full w-full'>
            {CHOICE_ORDER.map((key, i) => {
              const wedgeStart = -90 + i * 30
              const wedgeEnd = wedgeStart + 30

              const labelAngle = wedgeStart + 15
              const labelRad = (labelAngle * Math.PI) / 180
              const labelRadius = 35
              const labelX = Number((50 + labelRadius * Math.cos(labelRad)).toFixed(2))
              const labelY = Number((50 + labelRadius * Math.sin(labelRad)).toFixed(2))

              return (
                <g key={key}>
                  <path
                    d={wedgePath(50, 50, 49.5, wedgeStart, wedgeEnd)}
                    fill={CHOICES[key].color}
                    className='transition-opacity duration-300'
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    fill='white'
                    fontSize='4'
                    fontWeight='600'
                    textAnchor='middle'
                    dominantBaseline='middle'
                    className='pointer-events-none select-none'
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                  >
                    {CHOICES[key].emoji}
                  </text>
                </g>
              )
            })}
            <circle cx='50' cy='50' r='15' fill='hsl(var(--background))' opacity='0.95' />
            <circle
              cx='50'
              cy='50'
              r='15'
              fill='none'
              stroke='hsl(var(--border))'
              strokeWidth='0.5'
            />
          </svg>
        </motion.div>

        {/* Confetti */}
        <AnimatePresence>{showConfetti && <DecideConfetti />}</AnimatePresence>
      </div>

      {/* Result */}
      <motion.div
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'font-bold tracking-tight drop-shadow-sm',
            'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
            tone
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

      {/* Button */}
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

      {/* Legend */}
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
    </div>
  )
}
