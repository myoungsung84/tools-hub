'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import BackgroundScenePrimes from './background-scene-primes'
import BackgroundSceneSpace from './background-scene-space'

const SCENES = [
  { key: 'space', Component: BackgroundSceneSpace },
  { key: 'primes', Component: BackgroundScenePrimes },
] as const

type SceneKey = (typeof SCENES)[number]['key']

export default function BackgroundSceneRotator() {
  const [selectedKey, setSelectedKey] = useState<SceneKey>(SCENES[0].key)

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      const index = Math.floor(Math.random() * SCENES.length)
      setSelectedKey(SCENES[index].key)
    })

    return () => window.cancelAnimationFrame(rafId)
  }, [])

  const SelectedScene = useMemo(() => {
    return SCENES.find(scene => scene.key === selectedKey)?.Component ?? null
  }, [selectedKey])

  return (
    <AnimatePresence mode='wait'>
      {SelectedScene && (
        <motion.div
          key={selectedKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <SelectedScene />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
