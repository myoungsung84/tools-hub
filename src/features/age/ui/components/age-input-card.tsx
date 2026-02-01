'use client'

import { RotateCcw } from 'lucide-react'
import * as React from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/client'

import type { ZodiacBasis } from '../../lib/schema/age.schema'

export default function AgeInputCard({
  birth,
  setBirth,
  asOf,
  setAsOf,
  zodiacBasis,
  setZodiacBasis,
  onReset,
  basisLabel,
}: {
  birth: string
  setBirth: React.Dispatch<React.SetStateAction<string>>
  asOf: string
  setAsOf: React.Dispatch<React.SetStateAction<string>>
  zodiacBasis: ZodiacBasis
  setZodiacBasis: React.Dispatch<React.SetStateAction<ZodiacBasis>>
  onReset: () => void
  basisLabel: Record<ZodiacBasis, string>
}) {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0 flex flex-col gap-1'>
            <CardTitle>입력</CardTitle>
            <CardDescription>생년월일과 기준일을 선택해주세요.</CardDescription>
          </div>

          <button
            type='button'
            onClick={onReset}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm',
              'bg-background hover:bg-muted/40 transition-colors'
            )}
          >
            <RotateCcw className='h-4 w-4' />
            초기화
          </button>
        </div>
      </CardHeader>

      <CardContent className='flex flex-col gap-6'>
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='age-birth' className='text-sm font-medium'>
              🎂 생년월일
            </label>
            <input
              id='age-birth'
              type='date'
              value={birth}
              onChange={e => setBirth(e.target.value)}
              min='1900-01-01'
              max='2100-12-31'
              className={cn(
                'h-11 w-full rounded-md border border-border bg-background px-3 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary/40',
                '[color-scheme:dark]'
              )}
            />
            <p className='text-xs text-muted-foreground'>언제 태어나셨나요?</p>
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='age-asof' className='text-sm font-medium'>
              📆 기준일
            </label>
            <input
              id='age-asof'
              type='date'
              value={asOf}
              onChange={e => setAsOf(e.target.value)}
              min='1900-01-01'
              max='2100-12-31'
              className={cn(
                'h-11 w-full rounded-md border border-border bg-background px-3 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary/40',
                '[color-scheme:dark]'
              )}
            />
            <p className='text-xs text-muted-foreground'>언제 기준으로 계산할까요? (기본: 오늘)</p>
          </div>
        </div>

        <div className='flex flex-col gap-3'>
          <div className='flex items-baseline justify-between gap-3'>
            <span className='text-sm font-medium'>🐉 띠 계산 기준</span>
            <span className='text-xs text-muted-foreground'>{basisLabel[zodiacBasis]}</span>
          </div>

          <div className='grid gap-3 md:grid-cols-3'>
            {(
              [
                { value: 'ipchun', label: '입춘 기준' },
                { value: 'seollal', label: '설날 기준' },
                { value: 'year', label: '출생년도' },
              ] as const
            ).map(opt => {
              const active = zodiacBasis === opt.value
              return (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => setZodiacBasis(opt.value)}
                  className={cn(
                    'h-11 rounded-md border px-4 text-sm transition-colors text-left',
                    active
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-border bg-background hover:bg-muted/40'
                  )}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          <p className='text-xs text-muted-foreground'>
            입춘이나 설날 전후로 태어나셨다면 띠가 달라질 수 있어요.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
