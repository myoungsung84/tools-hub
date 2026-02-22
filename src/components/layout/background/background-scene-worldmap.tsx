'use client'

import BackgroundSceneSvgPoints from './background-scene-svg-points'

export default function BackgroundSceneWorldMap({
  src = '/background/world.svg',
}: {
  src?: string
}) {
  return (
    <BackgroundSceneSvgPoints
      src={src}
      targetWidth={10}
      pointsPerShape={800}
      dropEvery={8}
      twinkleStrength={0.1}
      fadeInMs={800}
      colors={{ outline: 0x4cc9f0, dust: 0xffffff }}
      opacity={{ outline: 0.22, dust: 0.08 }}
      pointSize={{ outline: 0.011, dust: 0.007 }}
      camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      dpr={[1, 1]}
      background='#000'
      className='pointer-events-none fixed inset-0 -z-10'
    />
  )
}
