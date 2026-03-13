export type UnitCategoryId = 'length' | 'weight' | 'area' | 'temperature' | 'data'

export type UnitCategory = {
  id: UnitCategoryId
  label: string
}

export type UnitDimension = 'length' | 'weight' | 'area' | 'temperature' | 'data'

export type UnitKind = 'linear' | 'temperature'

export type UnitDefinition = {
  id: string
  categoryId: UnitCategoryId
  dimension: UnitDimension
  kind: UnitKind
  label: string
  symbol: string
  factorToBase?: number
}

export type UnitConversionResult = {
  id: string
  label: string
  symbol: string
  value: number
}

export type UnitConversionState =
  | {
      status: 'success'
      fromUnit: UnitDefinition
      results: UnitConversionResult[]
      inputValue: number
    }
  | {
      status: 'error'
      message: string
    }
