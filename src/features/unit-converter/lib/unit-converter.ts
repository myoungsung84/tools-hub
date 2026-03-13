import { UNITS_BY_CATEGORY } from './unit-converter.constants'
import { unitConverterRequestSchema } from './unit-converter.schema'
import type {
  UnitCategoryId,
  UnitConversionResult,
  UnitConversionState,
  UnitDefinition,
} from './unit-converter.types'

function toBase(unit: UnitDefinition, value: number) {
  if (unit.kind === 'temperature') {
    if (unit.id === 'celsius') return value
    if (unit.id === 'fahrenheit') return ((value - 32) * 5) / 9
    if (unit.id === 'kelvin') return value - 273.15
    throw new Error('지원하지 않는 온도 단위입니다.')
  }

  if (unit.factorToBase == null) {
    throw new Error('선형 변환 계수가 없습니다.')
  }

  return value * unit.factorToBase
}

function fromBase(unit: UnitDefinition, value: number) {
  if (unit.kind === 'temperature') {
    if (unit.id === 'celsius') return value
    if (unit.id === 'fahrenheit') return (value * 9) / 5 + 32
    if (unit.id === 'kelvin') return value + 273.15
    throw new Error('지원하지 않는 온도 단위입니다.')
  }

  if (unit.factorToBase == null) {
    throw new Error('선형 변환 계수가 없습니다.')
  }

  return value / unit.factorToBase
}

function findUnit(categoryId: UnitCategoryId, unitId: string) {
  const units = UNITS_BY_CATEGORY[categoryId]
  return units.find(unit => unit.id === unitId) ?? null
}

export function convertUnits(input: unknown): UnitConversionState {
  const parsed = unitConverterRequestSchema.safeParse(input)
  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? '입력값이 올바르지 않습니다.',
    }
  }

  const { categoryId, fromUnitId, value } = parsed.data

  const fromUnit = findUnit(categoryId, fromUnitId)
  if (!fromUnit) {
    return { status: 'error', message: '기준 단위를 찾을 수 없습니다.' }
  }

  const categoryUnits = UNITS_BY_CATEGORY[categoryId]
  const baseValue = toBase(fromUnit, value)

  const results: UnitConversionResult[] = categoryUnits.map(unit => ({
      id: unit.id,
      label: unit.label,
      symbol: unit.symbol,
      value: fromBase(unit, baseValue),
    }))

  return {
    status: 'success',
    fromUnit,
    results,
    inputValue: value,
  }
}

export function formatConvertedValue(value: number): string {
  if (!Number.isFinite(value)) return '-'
  if (value === 0) return '0'

  const abs = Math.abs(value)
  const maximumFractionDigits =
    abs >= 1_000_000 ? 2 : abs >= 1 ? 6 : abs >= 0.001 ? 8 : 12

  return value.toLocaleString('ko-KR', { maximumFractionDigits })
}
