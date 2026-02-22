'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { SVGResult } from 'three-stdlib'
import { SVGLoader } from 'three-stdlib'

export type SvgPointsProps = {
  /** SVG 경로 (public 기준). 예: public/background/world.svg => "/background/world.svg" */
  src: string

  /** SVG를 월드 좌표계로 맞춘 뒤, 최종 가로폭(월드 유닛) */
  targetWidth: number

  /** 외곽선 샘플링 밀도(클수록 부드럽고 무거움) */
  pointsPerShape: number

  /** 점 드랍 간격(1=전부, 2=절반, 3=1/3...) */
  dropEvery: number

  /** 0이면 고정, 0.02~0.08 정도 추천 */
  twinkleStrength: number

  /** 포인트 색상 */
  colors: { outline: number; dust: number }

  /** 포인트 크기 */
  pointSize: { outline: number; dust: number }

  /** 기본 opacity */
  opacity: { outline: number; dust: number }

  /** 첫 등장 페이드 인(ms). 0이면 즉시 */
  fadeInMs?: number

  /** Canvas 카메라 */
  camera: { position: [number, number, number]; fov: number; near: number; far: number }

  /** Canvas gl 옵션 */
  gl: { antialias: boolean; powerPreference: WebGLPowerPreference }

  /** DPR 범위 */
  dpr: [number, number]

  /** Canvas 배경색 */
  background: string

  /** 최상위 wrapper className */
  className?: string
}

function buildOutlineGeometry(opts: {
  data: SVGResult
  pointsPerShape: number
  dropEvery: number
  targetWidth: number
}) {
  const { data, pointsPerShape, dropEvery, targetWidth } = opts
  const pts: number[] = []

  for (const path of data.paths) {
    const shapes = path.toShapes(true)
    for (const shape of shapes) {
      const spaced = shape.getSpacedPoints(pointsPerShape)
      for (let i = 0; i < spaced.length; i++) {
        if (dropEvery > 1 && i % dropEvery !== 0) continue
        const p = spaced[i]
        pts.push(p.x, -p.y, 0)
      }
    }
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))

  g.computeBoundingBox()
  const box = g.boundingBox
  if (box) {
    const size = new THREE.Vector3()
    box.getSize(size)
    const w = Math.max(size.x, 0.0001)
    const s = targetWidth / w
    g.scale(s, s, 1)
  }

  g.center()
  return g
}

function SvgPointCloud({
  src,
  targetWidth,
  pointsPerShape,
  dropEvery,
  twinkleStrength,
  colors,
  pointSize,
  opacity,
  fadeInMs = 900,
}: Omit<SvgPointsProps, 'camera' | 'gl' | 'dpr' | 'background' | 'className'>) {
  const data = useLoader(SVGLoader, src)

  const geo = useMemo(() => {
    return buildOutlineGeometry({ data, pointsPerShape, dropEvery, targetWidth })
  }, [data, pointsPerShape, dropEvery, targetWidth])

  const outlineMatRef = useRef<THREE.PointsMaterial | null>(null)
  const dustMatRef = useRef<THREE.PointsMaterial | null>(null)

  const timeRef = useRef(0)
  const fadeRef = useRef(0)

  useFrame((_, dt) => {
    const outlineMat = outlineMatRef.current
    const dustMat = dustMatRef.current
    if (!outlineMat || !dustMat) return

    timeRef.current += dt

    if (fadeInMs > 0 && fadeRef.current < 1) {
      fadeRef.current = Math.min(1, fadeRef.current + (dt * 1000) / fadeInMs)
    } else {
      fadeRef.current = 1
    }

    const f = fadeRef.current

    let oOutline = opacity.outline * f
    let oDust = opacity.dust * f

    if (twinkleStrength > 0) {
      const a = twinkleStrength * f
      oOutline += Math.sin(timeRef.current * 1.0) * a
      oDust += Math.sin(timeRef.current * 1.35 + 1.2) * (a * 0.55)
    }

    outlineMat.opacity = Math.max(0, oOutline)
    dustMat.opacity = Math.max(0, oDust)
  })

  return (
    <group>
      <points geometry={geo} frustumCulled>
        <pointsMaterial
          ref={outlineMatRef}
          color={colors.outline}
          size={pointSize.outline}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      <points geometry={geo} frustumCulled>
        <pointsMaterial
          ref={dustMatRef}
          color={colors.dust}
          size={pointSize.dust}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

export default function BackgroundSceneSvgPoints(props: SvgPointsProps) {
  const {
    camera,
    gl,
    dpr,
    background,
    className,
    src,
    targetWidth,
    pointsPerShape,
    dropEvery,
    twinkleStrength,
    colors,
    pointSize,
    opacity,
    fadeInMs,
  } = props

  return (
    <div className={className ?? 'pointer-events-none fixed inset-0 -z-10'}>
      <Canvas camera={camera} gl={gl} dpr={dpr} style={{ background }} frameloop='always'>
        <SvgPointCloud
          src={src}
          targetWidth={targetWidth}
          pointsPerShape={pointsPerShape}
          dropEvery={dropEvery}
          twinkleStrength={twinkleStrength}
          colors={colors}
          pointSize={pointSize}
          opacity={opacity}
          fadeInMs={fadeInMs}
        />
      </Canvas>
    </div>
  )
}
