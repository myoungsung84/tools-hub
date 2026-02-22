'use client'

import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

import BackgroundSceneEarthMoon from './background-scene-earth'
import BackgroundSceneSpace from './background-scene-space'
import BackgroundSceneWorldMap from './background-scene-worldmap'

const SCENES = [
  { key: 'space', Component: BackgroundSceneSpace },
  { key: 'earth', Component: BackgroundSceneEarthMoon },
  { key: 'worldmap', Component: BackgroundSceneWorldMap },
] as const

type SceneKey = (typeof SCENES)[number]['key']

export default function BackgroundSceneRotator() {
  const [selectedKey] = useState<SceneKey>(() => {
    const index = Math.floor(Math.random() * SCENES.length)
    return SCENES[index].key
  })

  const SelectedScene = useMemo(() => {
    return SCENES.find(scene => scene.key === selectedKey)?.Component ?? null
  }, [selectedKey])

  if (!SelectedScene) return null

  return (
    <motion.div
      key={selectedKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <SelectedScene />
    </motion.div>
  )
}
