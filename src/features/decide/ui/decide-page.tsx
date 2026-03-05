'use client'

import { clamp } from 'lodash-es'
import * as React from 'react'

import type { ResultState } from '../lib/decide.data'
import { CHOICES, STATE_UI } from '../lib/decide.data'
import { choiceFromRotation, pickTargetDelta, SPIN_MS } from '../lib/decide.math'
import DecideHeader from './components/decide-header'
import DecideLegend from './components/decide-legend'
import DecideResult from './components/decide-result'
import DecideSpinButton from './components/decide-spin-button'
import DecideWheel from './components/decide-wheel'

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
      <DecideHeader />
      <DecideWheel rotation={rotation} isSpinning={isSpinning} showConfetti={showConfetti} />
      <DecideResult emoji={emoji} headline={headline} message={message} toneClass={tone} />
      <DecideSpinButton isSpinning={isSpinning} isDone={isDone} onSpin={onSpin} />
      <DecideLegend />
    </div>
  )
}
