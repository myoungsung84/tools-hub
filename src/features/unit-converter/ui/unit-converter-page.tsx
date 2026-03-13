'use client'

import { ArrowLeftRight } from 'lucide-react'
import * as React from 'react'

import PageHeader from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/client'

import { convertUnits, formatConvertedValue } from '../lib/unit-converter'
import { DATA_UNIT_NOTE, UNIT_CATEGORIES, UNITS_BY_CATEGORY } from '../lib/unit-converter.constants'
import { unitCategoryIdSchema, unitValueSchema } from '../lib/unit-converter.schema'
import type { UnitCategoryId } from '../lib/unit-converter.types'

function getDefaultUnitId(categoryId: UnitCategoryId) {
  return UNITS_BY_CATEGORY[categoryId][0]?.id ?? ''
}

type ResultListProps = {
  items: Array<{ id: string; label: string; symbol: string; value: number }>
  fromUnitId: string
}

function ResultList({ items, fromUnitId }: ResultListProps) {
  return (
    <ul className='flex flex-col gap-2'>
      {items.map(item => (
        <li
          key={item.id}
          className={cn(
            'flex items-center justify-between rounded-lg border px-3 py-2 text-sm',
            item.id === fromUnitId ? 'border-primary/40 bg-primary/5' : 'bg-muted/20'
          )}
        >
          <span className='text-muted-foreground'>
            {item.label} ({item.symbol}) {item.id === fromUnitId ? '· 기준' : ''}
          </span>
          <strong className='font-semibold'>
            {formatConvertedValue(item.value)} {item.symbol}
          </strong>
        </li>
      ))}
    </ul>
  )
}

export default function UnitConverterPage() {
  const defaultCategoryId = UNIT_CATEGORIES[0]?.id ?? 'length'
  const [categoryId, setCategoryId] = React.useState<UnitCategoryId>(defaultCategoryId)
  const [fromUnitId, setFromUnitId] = React.useState<string>(getDefaultUnitId(defaultCategoryId))
  const [inputValue, setInputValue] = React.useState('1')

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

  const conversionState = React.useMemo(() => {
    const parsedValue = unitValueSchema.safeParse(inputValue)
    if (!parsedValue.success) {
      return {
        status: 'error' as const,
        message: parsedValue.error.issues[0]?.message ?? '유효한 숫자를 입력해 주세요.',
      }
    }

    return convertUnits({
      categoryId,
      fromUnitId,
      value: parsedValue.data,
    })
  }, [categoryId, fromUnitId, inputValue])

  const handleCategoryChange = (nextValue: string) => {
    const parsed = unitCategoryIdSchema.safeParse(nextValue)
    if (!parsed.success) return

    const nextCategoryId = parsed.data
    setCategoryId(nextCategoryId)
    setFromUnitId(getDefaultUnitId(nextCategoryId))
  }

  const handleUnitChange = (nextValue: string) => {
    if (categoryUnits.some(unit => unit.id === nextValue)) {
      setFromUnitId(nextValue)
    }
  }

  return (
    <div className={cn('w-full')}>
      <PageHeader
        icon={ArrowLeftRight}
        kicker='단위 변환기'
        title='길이부터 데이터까지 빠르게 변환하세요'
        description='카테고리와 기준 단위를 선택하고 값을 입력하면 선택한 카테고리의 전체 단위 결과를 한 번에 확인할 수 있습니다.'
      />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start'>
        <Card>
          <CardHeader>
            <CardTitle>기준 입력</CardTitle>
            <CardDescription>카테고리, 기준 단위, 값을 선택/입력하세요.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='unit-category'>카테고리</Label>
              <Select value={categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger id='unit-category' className='w-full'>
                  <SelectValue placeholder='카테고리 선택' />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <Label htmlFor='from-unit'>기준 단위</Label>
              <Select value={fromUnit?.id ?? ''} onValueChange={handleUnitChange}>
                <SelectTrigger id='from-unit' className='w-full'>
                  <SelectValue placeholder='기준 단위 선택' />
                </SelectTrigger>
                <SelectContent>
                  {categoryUnits.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.label} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <Label htmlFor='unit-value'>입력값</Label>
              <Input
                id='unit-value'
                type='number'
                inputMode='decimal'
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder='예: 1'
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>변환 결과</CardTitle>
            <CardDescription>
              {fromUnit ? `${inputValue || 0} ${fromUnit.symbol} 기준` : '기준 단위를 선택해 주세요.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conversionState.status === 'error' ? (
              <p className='text-sm text-destructive'>{conversionState.message}</p>
            ) : conversionState.results.length === 0 || !fromUnit ? (
              <p className='text-sm text-muted-foreground'>표시할 결과가 없습니다.</p>
            ) : (
              <div className='flex flex-col gap-3'>
                <ResultList items={conversionState.results} fromUnitId={fromUnit.id} />
                {categoryId === 'data' && (
                  <p className='text-xs text-muted-foreground'>{DATA_UNIT_NOTE}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
