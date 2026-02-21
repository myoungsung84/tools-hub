'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type Props = {
  seed?: number
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function buildGeo(pos: Float32Array) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return g
}

function makeSphereSurface(rand: () => number, count: number, radius: number) {
  const pos = new Float32Array(count * 3)
  const TAU = Math.PI * 2
  for (let i = 0; i < count; i++) {
    const theta = TAU * rand()
    const z = 2 * rand() - 1
    const rxy = Math.sqrt(1 - z * z)
    pos[i * 3] = rxy * Math.cos(theta) * radius
    pos[i * 3 + 1] = rxy * Math.sin(theta) * radius
    pos[i * 3 + 2] = z * radius
  }
  return pos
}

function makeStarField(rand: () => number, count: number, spread: number) {
  const pos = new Float32Array(count * 3)
  const TAU = Math.PI * 2
  for (let i = 0; i < count; i++) {
    const theta = TAU * rand()
    const phi = Math.acos(2 * rand() - 1)
    const r = spread * (0.6 + rand() * 0.4)
    const sinPhi = Math.sin(phi)
    pos[i * 3] = r * sinPhi * Math.cos(theta)
    pos[i * 3 + 1] = r * sinPhi * Math.sin(theta)
    pos[i * 3 + 2] = r * Math.cos(phi)
  }
  return pos
}

function makeOrbitRing(rand: () => number, count: number, orbitR: number, thickness: number) {
  const pos = new Float32Array(count * 3)
  const TAU = Math.PI * 2
  for (let i = 0; i < count; i++) {
    const a = TAU * rand()
    const r = orbitR + (rand() - 0.5) * thickness
    pos[i * 3] = r * Math.cos(a)
    pos[i * 3 + 1] = (rand() - 0.5) * thickness * 0.12
    pos[i * 3 + 2] = r * Math.sin(a)
  }
  return pos
}

const PALETTE = {
  starWarm: 0xffffff,
  starCool: 0x9fb7ff,

  earth: 0x7aa7ff,
  earthGlow: 0x7aa7ff,

  moon: 0xcfd3dd,
  orbit: 0x8ea2ff,
} as const

const HERO = {
  scale: 1.8,
  offsetX: -1.05,
  offsetY: -0.55,

  tiltX: 0.22,
  tiltY: 0.28,
  tiltZ: 0.06,

  moonOrbitR: 1.05,

  rootYaw: 0.01,
  earthSpin: 0.06,
  moonOrbit: 0.55,
  moonSpin: 0.2,
} as const

function Scene({ seed }: { seed: number }) {
  const rootRef = useRef<THREE.Group>(null)
  const earthRef = useRef<THREE.Group>(null)
  const moonPivotRef = useRef<THREE.Group>(null)
  const moonRef = useRef<THREE.Group>(null)

  const mats = useMemo(() => {
    const starMat = new THREE.PointsMaterial({
      color: PALETTE.starWarm,
      size: 0.02,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const starMat2 = new THREE.PointsMaterial({
      color: PALETTE.starCool,
      size: 0.014,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const earthGlowMat = new THREE.PointsMaterial({
      color: PALETTE.earthGlow,
      size: 0.013,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const earthMat = new THREE.PointsMaterial({
      color: PALETTE.earth,
      size: 0.017,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const moonGlowMat = new THREE.PointsMaterial({
      color: PALETTE.moon,
      size: 0.01,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const moonMat = new THREE.PointsMaterial({
      color: PALETTE.moon,
      size: 0.012,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const orbitMat = new THREE.PointsMaterial({
      color: PALETTE.orbit,
      size: 0.0045,
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    return { starMat, starMat2, earthGlowMat, earthMat, moonGlowMat, moonMat, orbitMat }
  }, [])

  const geos = useMemo(() => {
    const rand = mulberry32(seed)

    const stars1 = buildGeo(makeStarField(rand, 22000, 60))
    const stars2 = buildGeo(makeStarField(rand, 9000, 50))

    const earthGeo = buildGeo(makeSphereSurface(rand, 22000, 0.62))
    const earthGlowGeo = buildGeo(makeSphereSurface(rand, 8000, 0.78))

    const moonGeo = buildGeo(makeSphereSurface(rand, 5200, 0.17))
    const moonGlowGeo = buildGeo(makeSphereSurface(rand, 1800, 0.22))

    const orbitGeo = buildGeo(makeOrbitRing(rand, 1400, HERO.moonOrbitR, 0.01))

    return { stars1, stars2, earthGeo, earthGlowGeo, moonGeo, moonGlowGeo, orbitGeo }
  }, [seed])

  useEffect(() => {
    return () => {
      geos.stars1.dispose()
      geos.stars2.dispose()
      geos.earthGeo.dispose()
      geos.earthGlowGeo.dispose()
      geos.moonGeo.dispose()
      geos.moonGlowGeo.dispose()
      geos.orbitGeo.dispose()

      mats.starMat.dispose()
      mats.starMat2.dispose()
      mats.earthGlowMat.dispose()
      mats.earthMat.dispose()
      mats.moonGlowMat.dispose()
      mats.moonMat.dispose()
      mats.orbitMat.dispose()
    }
  }, [geos, mats])

  useFrame((_, dt) => {
    if (rootRef.current) rootRef.current.rotation.y += dt * HERO.rootYaw
    if (earthRef.current) earthRef.current.rotation.y += dt * HERO.earthSpin
    if (moonPivotRef.current) moonPivotRef.current.rotation.y += dt * HERO.moonOrbit
    if (moonRef.current) moonRef.current.rotation.y += dt * HERO.moonSpin
  })

  return (
    <>
      <points geometry={geos.stars1} material={mats.starMat} frustumCulled />
      <points geometry={geos.stars2} material={mats.starMat2} frustumCulled />

      <group
        ref={rootRef}
        rotation={[HERO.tiltX, HERO.tiltY, HERO.tiltZ]}
        scale={HERO.scale}
        position={[HERO.offsetX, HERO.offsetY, 0]}
      >
        <points geometry={geos.orbitGeo} material={mats.orbitMat} frustumCulled />

        <group ref={earthRef}>
          <points geometry={geos.earthGlowGeo} material={mats.earthGlowMat} frustumCulled />
          <points geometry={geos.earthGeo} material={mats.earthMat} frustumCulled />
        </group>

        <group ref={moonPivotRef} rotation={[0.08, 1.2, 0]}>
          <group ref={moonRef} position={[HERO.moonOrbitR, 0, 0]}>
            <points geometry={geos.moonGlowGeo} material={mats.moonGlowMat} frustumCulled />
            <points geometry={geos.moonGeo} material={mats.moonMat} frustumCulled />
          </group>
        </group>
      </group>
    </>
  )
}

export default function BackgroundSceneEarthMoon({ seed = 20260221 }: Props) {
  const dpr = useMemo<[number, number]>(() => [1, 1.35], [])

  return (
    <div className='pointer-events-none fixed inset-0 -z-10'>
      <Canvas
        camera={{ position: [0, 2.2, 6.0], fov: 48, near: 0.1, far: 260 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={dpr}
        style={{ background: '#000' }}
        frameloop='always'
      >
        <Scene seed={seed} />
      </Canvas>

      <div className='absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent' />
      <div className='absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20' />
    </div>
  )
}
