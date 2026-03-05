'use client'

import { motion } from 'framer-motion'
import * as React from 'react'

export default function DecideConfetti() {
  const [particles] = React.useState(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: 50 + (Math.random() - 0.5) * 20,
      color: ['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][i % 7],
      delay: Math.random() * 0.3,
      y: -100 - Math.random() * 100,
      x: (Math.random() - 0.5) * 200,
    }))
  })

  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className='absolute h-2 w-2 rounded-full'
          style={{
            left: `${p.left}%`,
            top: '50%',
            background: p.color,
          }}
          initial={{ scale: 0, y: 0, x: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0.5],
            y: [0, p.y],
            x: [0, p.x],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
