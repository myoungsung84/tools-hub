'use client'

import type { Transition } from 'framer-motion'
import * as React from 'react'

import type { AgeResult, ZodiacBasis } from '../../lib/schema/age.schema'
import { CardMotion, PresenceMotion } from '../motion/age-motion'
import AgeResultCard from './age-result-card'

export default function AgeResultGrid({
  result,
  hasValues,
  zodiacBasis,
  basisLabel,
  cardMotion,
  spring,
  numberIn,
}: {
  result: AgeResult
  hasValues: boolean
  zodiacBasis: ZodiacBasis
  basisLabel: Record<ZodiacBasis, string>
  cardMotion: CardMotion
  spring: Transition
  numberIn: PresenceMotion
}) {
  return (
    <div className='flex flex-col gap-5'>
      <div className='grid gap-5 md:grid-cols-2'>
        <AgeResultCard
          layoutId='card-man'
          hasValues={hasValues}
          cardMotion={cardMotion}
          spring={spring}
          numberIn={numberIn}
          className='min-h-[100px] bg-muted/20'
          skeleton={
            <>
              <div className='h-3 w-12 rounded bg-muted-foreground/20 animate-pulse' />
              <div className='mt-3 h-9 w-20 rounded bg-muted-foreground/20 animate-pulse' />
              <div className='mt-3 h-3 w-32 rounded bg-muted-foreground/20 animate-pulse' />
            </>
          }
        >
          <div className='flex h-full flex-col justify-center'>
            <div className='text-xs font-medium text-muted-foreground'>만 나이</div>
            <div className='mt-2 text-3xl font-black tracking-tight tabular-nums'>
              {result.manAge}
              <span className='ml-1 text-base font-semibold text-muted-foreground'>세</span>
            </div>
            <div className='mt-2 text-xs text-muted-foreground'>{result.asOf} 기준</div>
          </div>
        </AgeResultCard>

        <AgeResultCard
          layoutId='card-korean'
          hasValues={hasValues}
          cardMotion={cardMotion}
          spring={spring}
          numberIn={numberIn}
          className='min-h-[100px] bg-muted/20'
          skeleton={
            <>
              <div className='h-3 w-16 rounded bg-muted-foreground/20 animate-pulse' />
              <div className='mt-3 h-9 w-20 rounded bg-muted-foreground/20 animate-pulse' />
              <div className='mt-3 h-3 w-32 rounded bg-muted-foreground/20 animate-pulse' />
            </>
          }
        >
          <div className='flex h-full flex-col justify-center'>
            <div className='text-xs font-medium text-muted-foreground'>세는나이</div>
            <div className='mt-2 text-3xl font-black tracking-tight tabular-nums'>
              {result.koreanAge}
              <span className='ml-1 text-base font-semibold text-muted-foreground'>세</span>
            </div>
            <div className='mt-2 text-xs text-muted-foreground'>{result.birth} 출생</div>
          </div>
        </AgeResultCard>
      </div>

      <div className='grid gap-5 md:grid-cols-3'>
        <AgeResultCard
          layoutId='card-zodiac'
          hasValues={hasValues}
          cardMotion={cardMotion}
          spring={spring}
          numberIn={numberIn}
          className='min-h-[140px] bg-background'
          skeleton={
            <>
              <div className='h-3 w-8 rounded bg-muted-foreground/20 animate-pulse' />
              <div className='mt-3 h-7 w-16 rounded bg-muted-foreground/20 animate-pulse' />
              <div className='mt-3 h-3 w-24 rounded bg-muted-foreground/20 animate-pulse' />
            </>
          }
        >
          <div className='text-xs font-medium text-muted-foreground'>🐉 띠</div>
          <div className='mt-3 text-xl font-extrabold tracking-tight'>{result.zodiac?.label}</div>
          <div className='mt-3 text-xs text-muted-foreground'>{basisLabel[zodiacBasis]}로 계산</div>

          {result.zodiac?.note ? (
            <div className='mt-2 text-xs text-muted-foreground'>{result.zodiac.note}</div>
          ) : null}

          {result.zodiac?.cutoffDate ? (
            <div className='mt-2 text-xs text-muted-foreground'>
              컷오프 {result.zodiac.cutoffDate}
            </div>
          ) : null}
        </AgeResultCard>

        <AgeResultCard
          layoutId='card-western'
          hasValues={hasValues}
          cardMotion={cardMotion}
          spring={spring}
          numberIn={numberIn}
          className='min-h-[140px] bg-background'
          skeleton={
            <>
              <div className='h-3 w-10 rounded bg-muted-foreground/20 animate-pulse' />
              <div className='mt-3 h-7 w-20 rounded bg-muted-foreground/20 animate-pulse' />
              <div className='mt-3 h-3 w-28 rounded bg-muted-foreground/20 animate-pulse' />
            </>
          }
        >
          <div className='text-xs font-medium text-muted-foreground'>✨ 별자리</div>
          <div className='mt-3 text-xl font-extrabold tracking-tight'>{result.westernZodiac}</div>
          <div className='mt-3 text-xs text-muted-foreground'>양력 생일 기준이에요</div>
        </AgeResultCard>

        <AgeResultCard
          layoutId='card-ganji'
          hasValues={hasValues}
          cardMotion={cardMotion}
          spring={spring}
          numberIn={numberIn}
          className='min-h-[140px] bg-background'
          skeleton={
            <>
              <div className='h-3 w-8 rounded bg-muted-foreground/20 animate-pulse' />
              <div className='mt-3 h-7 w-12 rounded bg-muted-foreground/20 animate-pulse' />
              <div className='mt-3 h-3 w-32 rounded bg-muted-foreground/20 animate-pulse' />
            </>
          }
        >
          <div className='text-xs font-medium text-muted-foreground'>🎋 간지</div>
          <div className='mt-3 text-xl font-extrabold tracking-tight'>{result.ganji?.label}</div>
          <div className='mt-3 text-xs text-muted-foreground'>태어난 해의 육십갑자</div>
        </AgeResultCard>
      </div>
    </div>
  )
}
