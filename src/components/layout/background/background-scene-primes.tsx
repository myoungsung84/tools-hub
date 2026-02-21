'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

function buildPrimeSieve(n: number) {
  const isPrime = new Uint8Array(n + 1)
  if (n >= 2) isPrime.fill(1, 2)

  const limit = Math.floor(Math.sqrt(n))
  for (let p = 2; p <= limit; p++) {
    if (!isPrime[p]) continue
    for (let k = p * p; k <= n; k += p) isPrime[k] = 0
  }
  return isPrime
}

function ulamCoords(count: number) {
  const xs = new Int32Array(count + 1)
  const ys = new Int32Array(count + 1)

  let x = 0
  let y = 0
  xs[1] = 0
  ys[1] = 0

  let stepLen = 1
  let n = 2

  const move = (dx: number, dy: number, len: number) => {
    for (let i = 0; i < len && n <= count; i++) {
      x += dx
      y += dy
      xs[n] = x
      ys[n] = y
      n++
    }
  }

  while (n <= count) {
    move(1, 0, stepLen)
    move(0, 1, stepLen)
    stepLen++
    move(-1, 0, stepLen)
    move(0, -1, stepLen)
    stepLen++
  }

  return { xs, ys }
}

const PARAMS = {
  count: 200_000,
  step: 0.014,

  primeSize: 0.024,
  primeOpacityBase: 0.4,

  dustStride: 3,
  dustSize: 0.015,
  dustOpacityBase: 0.12,

  camZ: 7.0,
} as const

function UlamField() {
  const groupRef = useRef<THREE.Group>(null)

  const primeMatRef = useRef<THREE.PointsMaterial | null>(null)
  const dustMatRef = useRef<THREE.PointsMaterial | null>(null)

  const { viewport } = useThree()

  const { primeGeo, dustGeo, maxAbsCoord } = useMemo(() => {
    const count = PARAMS.count
    const step = PARAMS.step

    const isPrime = buildPrimeSieve(count)
    const { xs, ys } = ulamCoords(count)

    let maxAbs = 0
    for (let i = 1; i <= count; i++) {
      const ax = Math.abs(xs[i])
      const ay = Math.abs(ys[i])
      if (ax > maxAbs) maxAbs = ax
      if (ay > maxAbs) maxAbs = ay
    }

    let primeCount = 0
    let dustCount = 0
    for (let n = 1; n <= count; n++) {
      if (isPrime[n]) primeCount++
      else if (n % PARAMS.dustStride === 0) dustCount++
    }

    const primePos = new Float32Array(primeCount * 3)
    const dustPos = new Float32Array(dustCount * 3)

    let pIdx = 0
    let dIdx = 0
    for (let n = 1; n <= count; n++) {
      const x = xs[n] * step
      const y = ys[n] * step

      if (isPrime[n]) {
        primePos[pIdx++] = x
        primePos[pIdx++] = y
        primePos[pIdx++] = 0
      } else if (n % PARAMS.dustStride === 0) {
        dustPos[dIdx++] = x
        dustPos[dIdx++] = y
        dustPos[dIdx++] = 0
      }
    }

    const gPrime = new THREE.BufferGeometry()
    gPrime.setAttribute('position', new THREE.BufferAttribute(primePos, 3))

    const gDust = new THREE.BufferGeometry()
    gDust.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))

    return { primeGeo: gPrime, dustGeo: gDust, maxAbsCoord: maxAbs }
  }, [])

  useEffect(() => {
    const g = groupRef.current
    if (!g) return

    const halfWorld = maxAbsCoord * PARAMS.step
    const targetHalf = Math.min(viewport.width, viewport.height) * 0.5
    const scale = (targetHalf / Math.max(0.001, halfWorld)) * 1.18
    g.scale.setScalar(scale)
  }, [viewport.width, viewport.height, maxAbsCoord])

  const primeMat = useMemo(() => {
    return new THREE.PointsMaterial({
      color: 0xffffff,
      size: PARAMS.primeSize,
      sizeAttenuation: true,
      transparent: true,
      opacity: PARAMS.primeOpacityBase,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  const dustMat = useMemo(() => {
    return new THREE.PointsMaterial({
      color: 0xffffff,
      size: PARAMS.dustSize,
      sizeAttenuation: true,
      transparent: true,
      opacity: PARAMS.dustOpacityBase,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [])

  useEffect(() => {
    primeMatRef.current = primeMat
    dustMatRef.current = dustMat
    return () => {
      primeMatRef.current = null
      dustMatRef.current = null
    }
  }, [primeMat, dustMat])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // 과하지 않게: 아주 미세한 숨쉬기만 (거의 안 느껴지는 수준)
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.35)

    const pm = primeMatRef.current
    const dm = dustMatRef.current

    if (pm) pm.opacity = PARAMS.primeOpacityBase * (0.98 + pulse * 0.04)
    if (dm) dm.opacity = PARAMS.dustOpacityBase * (0.98 + pulse * 0.06)

    // 회전도 “거의 정지” 수준
    if (groupRef.current) groupRef.current.rotation.z = t * 0.003
  })

  return (
    <group ref={groupRef}>
      <points geometry={dustGeo} material={dustMat} />
      <points geometry={primeGeo} material={primeMat} />
    </group>
  )
}

export default function BackgroundScenePrimes() {
  return (
    <div className='pointer-events-none fixed inset-0 -z-10'>
      <Canvas
        camera={{ position: [0, 0, PARAMS.camZ], fov: 55, near: 0.1, far: 200 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: '#000' }}
      >
        <UlamField />
      </Canvas>

      <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/15 to-black/70' />
      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35' />
      <div className='absolute inset-0 [background:radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.18)_45%,rgba(0,0,0,0.75)_100%)]' />
    </div>
  )
}
