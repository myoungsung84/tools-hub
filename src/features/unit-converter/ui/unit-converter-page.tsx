'use client'

import { ArrowLeftRight } from 'lucide-react'
import * as React from 'react'

import PageHeader from '@/components/layout/page-header'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/client'

import { convertUnits, formatConvertedValue } from '../lib/unit-converter'
import { DATA_UNIT_NOTE, UNIT_CATEGORIES, UNITS_BY_CATEGORY } from '../lib/unit-converter.constants'
import { unitCategoryIdSchema, unitValueSchema } from '../lib/unit-converter.schema'
import type { UnitCategoryId, UnitConversionState } from '../lib/unit-converter.types'
import UnitConverterResultList from './components/unit-converter-result-list'
import UnitConverterStepSection from './components/unit-converter-step-section'

function getDefaultUnitId(categoryId: UnitCategoryId) {
  return UNITS_BY_CATEGORY[categoryId][0]?.id ?? ''
}

function getConversionState(input: {
  categoryId: UnitCategoryId
  fromUnitId: string
  inputValue: string
}): UnitConversionState {
  const parsedValue = unitValueSchema.safeParse(input.inputValue)
  if (!parsedValue.success) {
    return {
      status: 'error',
      message: parsedValue.error.issues[0]?.message ?? '유효한 숫자를 입력해 주세요.',
    }
  }

  return convertUnits({
    categoryId: input.categoryId,
    fromUnitId: input.fromUnitId,
    value: parsedValue.data,
  })
}

export default function UnitConverterPage() {
  const defaultCategoryId = UNIT_CATEGORIES[0]?.id ?? 'length'
  const [categoryId, setCategoryId] = React.useState<UnitCategoryId>(defaultCategoryId)
  const [fromUnitId, setFromUnitId] = React.useState<string>(getDefaultUnitId(defaultCategoryId))
  const [inputValue, setInputValue] = React.useState('1')
  const [focused, setFocused] = React.useState(false)

  const categoryUnits = React.useMemo(() => UNITS_BY_CATEGORY[categoryId], [categoryId])
  const fromUnit = React.useMemo(
    () => categoryUnits.find(unit => unit.id === fromUnitId) ?? categoryUnits[0] ?? null,
    [categoryUnits, fromUnitId]
  )

  React.useEffect(() => {
    if (!fromUnit && categoryUnits[0]) {
      setFromUnitId(categoryUnits[0].id)
    }
  }, [fromUnit, categoryUnits])

  const conversionState = React.useMemo(
    () => getConversionState({ categoryId, fromUnitId, inputValue }),
    [categoryId, fromUnitId, inputValue]
  )

  const handleCategoryChange = (nextValue: string) => {
    const parsed = unitCategoryIdSchema.safeParse(nextValue)
    if (!parsed.success) return
    setCategoryId(parsed.data)
    setFromUnitId(getDefaultUnitId(parsed.data))
  }

  const handleUnitChange = (nextValue: string) => {
    if (categoryUnits.some(unit => unit.id === nextValue)) {
      setFromUnitId(nextValue)
    }
  }

  return (
    <div className='w-full'>
      <PageHeader
        icon={ArrowLeftRight}
        kicker='단위 변환기'
        title='길이부터 부피까지 빠르게 변환하세요'
        description='카테고리와 기준 단위를 선택하고 값을 입력하면 선택한 카테고리의 전체 단위 결과를 한 번에 확인할 수 있습니다.'
      />

      <div className='flex flex-col gap-8'>
        <UnitConverterStepSection step={1} title='카테고리 선택'>
          <div role='group' aria-label='카테고리 선택' className='flex flex-wrap gap-2'>
            {UNIT_CATEGORIES.map(category => (
              <button
                key={category.id}
                type='button'
                aria-pressed={categoryId === category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={cn(
                  'rounded-lg border px-4 py-1.5 text-sm font-medium transition-all duration-200',
                  categoryId === category.id
                    ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.03]'
                    : 'border-border/70 bg-background/80 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/50'
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </UnitConverterStepSection>

        <UnitConverterStepSection step={2} title='기준 단위 선택'>
          <div role='group' aria-label='기준 단위 선택' className='flex flex-wrap gap-2'>
            {categoryUnits.map(unit => (
              <button
                key={unit.id}
                type='button'
                aria-pressed={fromUnitId === unit.id}
                onClick={() => handleUnitChange(unit.id)}
                className={cn(
                  'flex min-w-[5rem] flex-col items-start rounded-lg border px-3.5 py-2.5 text-left text-sm transition-all duration-200',
                  fromUnitId === unit.id
                    ? 'border-primary/40 bg-primary/8 shadow-sm shadow-primary/10 scale-[1.02]'
                    : 'border-border/60 bg-background/60 hover:border-border hover:bg-muted/40'
                )}
              >
                <span
                  className={cn(
                    'font-medium leading-tight',
                    fromUnitId === unit.id ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {unit.label}
                </span>
                <span className='font-mono text-[11px] text-muted-foreground/60'>{unit.symbol}</span>
              </button>
            ))}
          </div>
        </UnitConverterStepSection>

        <UnitConverterStepSection step={3} title='변환할 값 입력' htmlFor='unit-value'>
          <div
            className={cn(
              'relative flex w-full max-w-sm items-center rounded-lg border bg-background transition-all duration-200',
              focused
                ? 'border-primary shadow-lg shadow-primary/10 ring-4 ring-primary/10'
                : 'border-border/70 shadow-sm'
            )}
          >
            <Input
              id='unit-value'
              type='number'
              inputMode='decimal'
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder='예: 1'
              className='border-0 bg-transparent pr-16 text-xl font-bold shadow-none ring-0 focus-visible:ring-0'
            />
            {fromUnit && (
              <span className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-md bg-muted/80 px-2 py-1 font-mono text-xs font-medium text-muted-foreground'>
                {fromUnit.symbol}
              </span>
            )}
          </div>
        </UnitConverterStepSection>

        <section className='flex flex-col gap-4'>
          <div className='flex items-center gap-3'>
            <div className='h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent' />
            <div className='flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-1'>
              <ArrowLeftRight className='h-3 w-3 text-muted-foreground' />
              <span className='text-xs font-medium text-muted-foreground'>변환 결과</span>
              {fromUnit && conversionState.status !== 'error' && (
                <span className='text-xs text-muted-foreground/60'>
                  · {inputValue || 0} {fromUnit.symbol}
                </span>
              )}
            </div>
            <div className='h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent' />
          </div>

          {conversionState.status === 'error' ? (
            <div className='rounded-lg border border-destructive/30 bg-destructive/5 px-5 py-4'>
              <p className='text-sm text-destructive'>{conversionState.message}</p>
            </div>
          ) : conversionState.results.length === 0 || !fromUnit ? (
            <p className='text-sm text-muted-foreground'>표시할 결과가 없습니다.</p>
          ) : (
            <div className='flex flex-col gap-3'>
              <UnitConverterResultList
                items={conversionState.results}
                fromUnitId={fromUnit.id}
                formatValue={formatConvertedValue}
              />
              {categoryId === 'data' && (
                <p className='rounded-lg border border-border/40 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground'>
                  {DATA_UNIT_NOTE}
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
