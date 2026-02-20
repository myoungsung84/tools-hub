'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function rng() {
  return Math.random()
}

function makeSphereSurface(count: number, radius: number) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * rng()
    const z = 2 * rng() - 1
    const rxy = Math.sqrt(1 - z * z)
    pos[i * 3] = rxy * Math.cos(theta) * radius
    pos[i * 3 + 1] = rxy * Math.sin(theta) * radius
    pos[i * 3 + 2] = z * radius
  }
  return pos
}

function makeOrbitRing(count: number, orbitR: number, thickness: number, tilt = 0) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const angle = 2 * Math.PI * rng()
    const r = orbitR + (rng() - 0.5) * thickness
    pos[i * 3] = r * Math.cos(angle)
    pos[i * 3 + 1] = (rng() - 0.5) * thickness * 0.3
    pos[i * 3 + 2] = r * Math.sin(angle)
  }
  if (tilt !== 0) {
    const m = new THREE.Matrix4().makeRotationZ(tilt)
    const v = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      v.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]).applyMatrix4(m)
      pos[i * 3] = v.x
      pos[i * 3 + 1] = v.y
      pos[i * 3 + 2] = v.z
    }
  }
  return pos
}

function makeSaturnRing(count: number, innerR: number, outerR: number) {
  const pos = new Float32Array(count * 3)
  const i2 = innerR * innerR,
    o2 = outerR * outerR
  for (let i = 0; i < count; i++) {
    const angle = 2 * Math.PI * rng()
    const r = Math.sqrt(i2 + rng() * (o2 - i2))
    pos[i * 3] = r * Math.cos(angle)
    pos[i * 3 + 1] = (rng() - 0.5) * 0.04
    pos[i * 3 + 2] = r * Math.sin(angle)
  }
  return pos
}

function makeStarField(count: number, spread: number) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * rng()
    const phi = Math.acos(2 * rng() - 1)
    const r = spread * (0.6 + rng() * 0.4)
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    pos[i * 3 + 2] = r * Math.cos(phi)
  }
  return pos
}

function makeBelt(count: number, innerR: number, outerR: number, yJitter: number) {
  const pos = new Float32Array(count * 3)
  const i2 = innerR * innerR
  const o2 = outerR * outerR
  for (let i = 0; i < count; i++) {
    const angle = 2 * Math.PI * rng()
    const r = Math.sqrt(i2 + rng() * (o2 - i2))
    pos[i * 3] = r * Math.cos(angle)
    pos[i * 3 + 1] = (rng() - 0.5) * yJitter
    pos[i * 3 + 2] = r * Math.sin(angle)
  }
  return pos
}

function buildGeo(pos: Float32Array) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return g
}

function buildMat(color: number, size: number, opacity = 1) {
  return new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
}

// ✅ orbit spacing
const ORBIT_SCALE = 1.35
const scaleOrbit = (r: number) => r * ORBIT_SCALE

const PALETTE = {
  starWarm: 0xffffff,
  starCool: 0x9fb7ff,
  orbit: 0x8ea2ff,

  sunCore: 0xfff1b3,
  sunGlow1: 0xffc15a,
  sunGlow2: 0xff7a2f,
  corona: 0xff4d1a,

  asteroid: 0x7d7a70,
  kuiper: 0x86a7ff,
  kuiperDust: 0x9fb7ff,

  saturnRing: 0xd4c090,

  moon: 0xcfd3dd,
  pluto: 0xd8d4cf,
  plutoGlow: 0xa9c7ff,
} as const

const PLANETS = [
  {
    name: 'mercury',
    orbitR: scaleOrbit(1.2),
    size: 800,
    speed: 1.6,
    color: 0x9e9e9e,
    pSize: 0.018,
    tilt: 0.1,
    initialAngle: 0.8,
  },
  {
    name: 'venus',
    orbitR: scaleOrbit(1.65),
    size: 1400,
    speed: 1.17,
    color: 0xf0c060,
    pSize: 0.022,
    tilt: 0.06,
    initialAngle: 2.1,
  },
  {
    name: 'earth',
    orbitR: scaleOrbit(2.15),
    size: 1600,
    speed: 1.0,
    color: 0x44cc88,
    pSize: 0.023,
    tilt: 0.0,
    initialAngle: 3.9,
  },
  {
    name: 'mars',
    orbitR: scaleOrbit(2.75),
    size: 1100,
    speed: 0.8,
    color: 0xcc4422,
    pSize: 0.019,
    tilt: 0.03,
    initialAngle: 1.3,
  },
  {
    name: 'jupiter',
    orbitR: scaleOrbit(3.8),
    size: 5000,
    speed: 0.43,
    color: 0xd4a96a,
    pSize: 0.038,
    tilt: 0.02,
    initialAngle: 5.1,
  },
  {
    name: 'saturn',
    orbitR: scaleOrbit(5.1),
    size: 4000,
    speed: 0.32,
    color: 0xeedd88,
    pSize: 0.032,
    tilt: 0.04,
    initialAngle: 0.4,
  },
  {
    name: 'uranus',
    orbitR: scaleOrbit(6.4),
    size: 2600,
    speed: 0.22,
    color: 0x7fffee,
    pSize: 0.026,
    tilt: 0.01,
    initialAngle: 4.4,
  },
  {
    name: 'neptune',
    orbitR: scaleOrbit(7.6),
    size: 2400,
    speed: 0.18,
    color: 0x2255dd,
    pSize: 0.024,
    tilt: 0.03,
    initialAngle: 2.7,
  },
] as const

// ------------------------------
// Geometry / Materials (static)
// ------------------------------

const starGeo = buildGeo(makeStarField(24000, 60))
const starGeo2 = buildGeo(makeStarField(10000, 50))
const starMat = buildMat(PALETTE.starWarm, 0.022, 0.5)
const starMat2 = buildMat(PALETTE.starCool, 0.015, 0.22)

const sunGeo = buildGeo(makeSphereSurface(20000, 0.58))
const sunGlowGeo = buildGeo(makeSphereSurface(9000, 0.74))
const sunGlowGeo2 = buildGeo(makeSphereSurface(5000, 0.94))
const coronaGeo = buildGeo(makeSphereSurface(5200, 1.12))

const sunMat = buildMat(PALETTE.sunCore, 0.02, 1.0)
const sunGlowMat = buildMat(PALETTE.sunGlow1, 0.016, 0.42)
const sunGlowMat2 = buildMat(PALETTE.sunGlow2, 0.014, 0.2)
const coronaMat = buildMat(PALETTE.corona, 0.012, 0.1)

// asteroid belt (scaled)
const asteroidGeo = buildGeo(
  (() => {
    const count = 8000
    const inner = scaleOrbit(3.25)
    const outer = scaleOrbit(3.75)
    return makeBelt(count, inner, outer, 0.28)
  })()
)
const asteroidMat = buildMat(PALETTE.asteroid, 0.008, 0.35)

const orbitMat = buildMat(PALETTE.orbit, 0.005, 0.065)

// Kuiper belt (distant, subtle, “dwarf planet vibe”)
const kuiperGeo = buildGeo(
  (() => {
    const count = 12000
    const inner = scaleOrbit(8.6)
    const outer = scaleOrbit(11.2)
    return makeBelt(count, inner, outer, 0.55)
  })()
)
const kuiperGeo2 = buildGeo(
  (() => {
    const count = 7000
    const inner = scaleOrbit(9.2)
    const outer = scaleOrbit(12.0)
    return makeBelt(count, inner, outer, 0.7)
  })()
)
const kuiperMat = buildMat(PALETTE.kuiper, 0.006, 0.16)
const kuiperMat2 = buildMat(PALETTE.kuiperDust, 0.0045, 0.08)

// planet data (prebuilt)
const planetData = PLANETS.map(p => ({
  ...p,
  sphereGeo: buildGeo(makeSphereSurface(p.size, p.pSize * 6)),
  glowGeo: buildGeo(makeSphereSurface(Math.floor(p.size * 0.3), p.pSize * 8)),
  planetMat: buildMat(p.color, 0.013, 0.95),
  glowMat: buildMat(p.color, 0.011, 0.2),
  orbitGeo: buildGeo(makeOrbitRing(1400, p.orbitR, 0.004, p.tilt)),
  saturnRingGeo:
    p.name === 'saturn'
      ? (() => {
          const g = buildGeo(makeSaturnRing(6000, p.pSize * 8.5, p.pSize * 17))
          g.applyMatrix4(new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(27)))
          return g
        })()
      : null,
  saturnRingMat: p.name === 'saturn' ? buildMat(PALETTE.saturnRing, 0.008, 0.5) : null,
}))

// ------------------------------
// Components
// ------------------------------

function StarField() {
  const ref1 = useRef<THREE.Points>(null)
  const ref2 = useRef<THREE.Points>(null)
  const t = useRef(0)

  useFrame((_, dt) => {
    t.current += dt
    if (ref1.current) ref1.current.rotation.y += dt * 0.004
    if (ref2.current) ref2.current.rotation.y -= dt * 0.002

    // subtle twinkle (shared mats)
    starMat.opacity = 0.46 + Math.sin(t.current * 0.7) * 0.04
    starMat2.opacity = 0.2 + Math.sin(t.current * 0.9 + 1.2) * 0.03
  })

  return (
    <>
      <points ref={ref1} geometry={starGeo} material={starMat} />
      <points ref={ref2} geometry={starGeo2} material={starMat2} />
    </>
  )
}

function Sun() {
  const ref = useRef<THREE.Group>(null)
  const tt = useRef(0)

  useFrame((_, dt) => {
    tt.current += dt
    if (ref.current) ref.current.rotation.y += dt * 0.06

    const pulse = 0.5 + 0.5 * Math.sin(tt.current * 1.25)
    coronaMat.opacity = 0.075 + pulse * 0.045
    sunGlowMat.opacity = 0.35 + pulse * 0.07
    sunGlowMat2.opacity = 0.14 + pulse * 0.035

    if (ref.current) {
      const s = 1 + pulse * 0.01
      ref.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={ref}>
      <points geometry={sunGeo} material={sunMat} />
      <points geometry={sunGlowGeo} material={sunGlowMat} />
      <points geometry={sunGlowGeo2} material={sunGlowMat2} />
      <points geometry={coronaGeo} material={coronaMat} />
    </group>
  )
}

function AsteroidBelt() {
  const ref = useRef<THREE.Points>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.04
  })
  return <points ref={ref} geometry={asteroidGeo} material={asteroidMat} />
}

function KuiperBelt() {
  const ref1 = useRef<THREE.Points>(null)
  const ref2 = useRef<THREE.Points>(null)
  const t = useRef(0)

  useFrame((_, dt) => {
    t.current += dt
    // super slow drift so it feels “distant”
    if (ref1.current) ref1.current.rotation.y += dt * 0.007
    if (ref2.current) ref2.current.rotation.y -= dt * 0.004

    // faint breathing (keeps it alive but not distracting)
    kuiperMat.opacity = 0.14 + (0.5 + 0.5 * Math.sin(t.current * 0.35)) * 0.05
    kuiperMat2.opacity = 0.06 + (0.5 + 0.5 * Math.sin(t.current * 0.28 + 1.3)) * 0.03
  })

  return (
    <group rotation={[0.18, 0.0, 0.04]}>
      <points ref={ref1} geometry={kuiperGeo} material={kuiperMat} />
      <points ref={ref2} geometry={kuiperGeo2} material={kuiperMat2} />
    </group>
  )
}

function Moon({
  orbitR,
  size,
  speed,
  initialAngle,
}: {
  orbitR: number
  size: number
  speed: number
  initialAngle: number
}) {
  const pivotRef = useRef<THREE.Group>(null)
  const selfRef = useRef<THREE.Group>(null)

  const moonGeo = useMemo(() => buildGeo(makeSphereSurface(520, size)), [size])
  const moonGlowGeo = useMemo(() => buildGeo(makeSphereSurface(220, size * 1.25)), [size])
  const moonMat = useMemo(() => buildMat(PALETTE.moon, 0.008, 0.85), [])
  const moonGlowMat = useMemo(() => buildMat(PALETTE.starCool, 0.007, 0.12), [])

  useFrame((_, dt) => {
    if (pivotRef.current) pivotRef.current.rotation.y += dt * speed
    if (selfRef.current) selfRef.current.rotation.y += dt * 0.8
  })

  return (
    <group ref={pivotRef} rotation={[0.08, initialAngle, 0]}>
      <group ref={selfRef} position={[orbitR, 0, 0]}>
        <points geometry={moonGlowGeo} material={moonGlowMat} />
        <points geometry={moonGeo} material={moonMat} />
      </group>
    </group>
  )
}

// “Pluto” as a dwarf planet object living in Kuiper belt (separate from PLANETS)
function DwarfPluto() {
  const pivotRef = useRef<THREE.Group>(null)
  const selfRef = useRef<THREE.Group>(null)

  // a bit “eccentric” orbit so it doesn’t feel like just another ring
  const orbitR = scaleOrbit(10.4)
  const orbitTilt = 0.22
  const speed = 0.06 // very slow

  const plutoGeo = useMemo(() => buildGeo(makeSphereSurface(900, 0.085)), [])
  const plutoGlowGeo = useMemo(() => buildGeo(makeSphereSurface(350, 0.11)), [])
  const plutoMat = useMemo(() => buildMat(PALETTE.pluto, 0.012, 0.95), [])
  const plutoGlowMat = useMemo(() => buildMat(PALETTE.plutoGlow, 0.01, 0.18), [])

  useFrame((_, dt) => {
    if (pivotRef.current) pivotRef.current.rotation.y += dt * speed
    if (selfRef.current) selfRef.current.rotation.y += dt * 0.35
  })

  return (
    <group ref={pivotRef} rotation={[orbitTilt, 2.3, 0]}>
      {/* small “orbit hint” for Pluto only (very subtle) */}
      <points
        geometry={useMemo(() => buildGeo(makeOrbitRing(900, orbitR, 0.006, 0.0)), [orbitR])}
        material={useMemo(() => buildMat(PALETTE.kuiperDust, 0.004, 0.03), [])}
      />

      <group ref={selfRef} position={[orbitR, 0, 0]}>
        <points geometry={plutoGlowGeo} material={plutoGlowMat} />
        <points geometry={plutoGeo} material={plutoMat} />
      </group>
    </group>
  )
}

function Planet({ data }: { data: (typeof planetData)[number] }) {
  const pivotRef = useRef<THREE.Group>(null)
  const selfRef = useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    if (pivotRef.current) pivotRef.current.rotation.y += dt * data.speed * 0.18
    if (selfRef.current) selfRef.current.rotation.y += dt * 0.4
  })

  const isEarth = data.name === 'earth'

  return (
    <group ref={pivotRef} rotation={[data.tilt, data.initialAngle, 0]}>
      <group ref={selfRef} position={[data.orbitR, 0, 0]}>
        <points geometry={data.glowGeo} material={data.glowMat} />
        <points geometry={data.sphereGeo} material={data.planetMat} />
        {data.saturnRingGeo && data.saturnRingMat && (
          <points geometry={data.saturnRingGeo} material={data.saturnRingMat} />
        )}

        {isEarth && (
          <Moon orbitR={data.pSize * 20} size={data.pSize * 2.15} speed={1.8} initialAngle={1.2} />
        )}
      </group>
    </group>
  )
}

function Scene() {
  return (
    <>
      <StarField />
      <group rotation={[0.35, 0.3, 0.05]}>
        <Sun />

        {planetData.map(p => (
          <points key={`orbit-${p.name}`} geometry={p.orbitGeo} material={orbitMat} />
        ))}

        <AsteroidBelt />

        {planetData.map(p => (
          <Planet key={p.name} data={p} />
        ))}

        {/* ✅ Kuiper belt + Pluto (dwarf planet) */}
        <KuiperBelt />
        <DwarfPluto />
      </group>
    </>
  )
}

export default function BackgroundScene() {
  return (
    <div className='pointer-events-none fixed inset-0 -z-10'>
      <Canvas
        camera={{ position: [0, 5.2, 16], fov: 50, near: 0.1, far: 260 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: '#000' }}
      >
        <Scene />
      </Canvas>

      <div className='absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent' />
      <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20' />
    </div>
  )
}
