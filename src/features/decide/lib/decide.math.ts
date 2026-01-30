import type { DecideChoice } from './decide.data'
import { CHOICE_ORDER } from './decide.data'

export const SPIN_MS = 2200
export const SECTION_DEG = 360 / 12

function normalizeDeg(deg: number) {
  const v = deg % 360
  return v < 0 ? v + 360 : v
}

export function choiceFromRotation(rotationDeg: number): DecideChoice {
  const pointerDeg = normalizeDeg(-rotationDeg)
  const idx = Math.floor(pointerDeg / SECTION_DEG)
  return CHOICE_ORDER[idx]
}

export function pickTargetDelta(currentRotation: number) {
  const idx = Math.floor(Math.random() * 12)
  const jitter = Math.random() * 10 - 5
  const center = idx * SECTION_DEG + SECTION_DEG / 2 + jitter

  const desired = normalizeDeg(-center)
  const current = normalizeDeg(currentRotation)
  return normalizeDeg(desired - current)
}
