'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type Props = {
  seed?: number
  qualityRamp?: boolean
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

// ------------------------------
// ✅ Material: 모듈 스코프 단일 인스턴스 (재사용)
// ------------------------------
const MATS = (() => {
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
})()

// ------------------------------
// ✅ Geometry: seed별 캐시 (핵심 최적화)
// - “마운트 순간” 생성이 아니라, 최초 1회 생성 후 재사용
// ------------------------------
type Geos = {
  stars1: THREE.BufferGeometry
  stars2: THREE.BufferGeometry
  earthGeo: THREE.BufferGeometry
  earthGlowGeo: THREE.BufferGeometry
  moonGeo: THREE.BufferGeometry
  moonGlowGeo: THREE.BufferGeometry
  orbitGeo: THREE.BufferGeometry
}

const GEO_CACHE = new Map<number, Geos>()

function getGeos(seed: number): Geos {
  const cached = GEO_CACHE.get(seed)
  if (cached) return cached

  const rand = mulberry32(seed)

  const geos: Geos = {
    stars1: buildGeo(makeStarField(rand, 2000, 60)),
    stars2: buildGeo(makeStarField(rand, 9000, 50)),

    earthGeo: buildGeo(makeSphereSurface(rand, 22000, 0.62)),
    earthGlowGeo: buildGeo(makeSphereSurface(rand, 2000, 0.78)),

    moonGeo: buildGeo(makeSphereSurface(rand, 5200, 0.17)),
    moonGlowGeo: buildGeo(makeSphereSurface(rand, 500, 0.22)),

    orbitGeo: buildGeo(makeOrbitRing(rand, 1400, HERO.moonOrbitR, 0.01)),
  }

  GEO_CACHE.set(seed, geos)
  return geos
}

function Scene({ seed }: { seed: number }) {
  const rootRef = useRef<THREE.Group>(null)
  const earthRef = useRef<THREE.Group>(null)
  const moonPivotRef = useRef<THREE.Group>(null)
  const moonRef = useRef<THREE.Group>(null)

  // ✅ 마운트 시점에 “생성”이 아니라 “캐시 조회”
  const geos = useMemo(() => getGeos(seed), [seed])

  useFrame((_, dt) => {
    if (rootRef.current) rootRef.current.rotation.y += dt * HERO.rootYaw
    if (earthRef.current) earthRef.current.rotation.y += dt * HERO.earthSpin
    if (moonPivotRef.current) moonPivotRef.current.rotation.y += dt * HERO.moonOrbit
    if (moonRef.current) moonRef.current.rotation.y += dt * HERO.moonSpin
  })

  return (
    <>
      <points geometry={geos.stars1} material={MATS.starMat} frustumCulled />
      <points geometry={geos.stars2} material={MATS.starMat2} frustumCulled />

      <group
        ref={rootRef}
        rotation={[HERO.tiltX, HERO.tiltY, HERO.tiltZ]}
        scale={HERO.scale}
        position={[HERO.offsetX, HERO.offsetY, 0]}
      >
        <points geometry={geos.orbitGeo} material={MATS.orbitMat} frustumCulled />

        <group ref={earthRef}>
          <points geometry={geos.earthGlowGeo} material={MATS.earthGlowMat} frustumCulled />
          <points geometry={geos.earthGeo} material={MATS.earthMat} frustumCulled />
        </group>

        <group ref={moonPivotRef} rotation={[0.08, 1.2, 0]}>
          <group ref={moonRef} position={[HERO.moonOrbitR, 0, 0]}>
            <points geometry={geos.moonGlowGeo} material={MATS.moonGlowMat} frustumCulled />
            <points geometry={geos.moonGeo} material={MATS.moonMat} frustumCulled />
          </group>
        </group>
      </group>
    </>
  )
}

export default function BackgroundSceneEarthMoon({ seed = 20262222, qualityRamp = true }: Props) {
  const [hq, setHq] = useState(!qualityRamp)

  useEffect(() => {
    if (!qualityRamp) return
    const id = requestAnimationFrame(() => setHq(true))
    return () => cancelAnimationFrame(id)
  }, [qualityRamp])

  const dpr = useMemo<[number, number]>(() => (hq ? [1, 1.35] : [1, 1]), [hq])

  return (
    <div className='pointer-events-none fixed inset-0 -z-10'>
      <Canvas
        key={hq ? 'hq' : 'lq'}
        camera={{ position: [0, 2.2, 6.0], fov: 48, near: 0.1, far: 260 }}
        gl={{ antialias: hq, powerPreference: 'high-performance' }}
        dpr={dpr}
        style={{ background: '#000' }}
        frameloop='always'
      >
        <Scene seed={seed} />
      </Canvas>
    </div>
  )
}
