'use client'

import dayjs from 'dayjs'
import { LayoutGroup, motion, type Transition, useReducedMotion } from 'framer-motion'
import { isNil } from 'lodash-es'
import { CalendarDays } from 'lucide-react'
import * as React from 'react'

import PageHeader from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/client'

import {
  ageInputSchema,
  calcAgeSummary,
  calcGanjiYear,
  calcWesternZodiac,
  calcZodiac,
} from '../lib'
import type { AgeResult, ZodiacBasis } from '../lib/schema/age.schema'
import AgeInputCard from './components/age-input-card'
import AgeResultFooter from './components/age-result-footer'
import AgeResultGrid from './components/age-result-grid'
import {
  buildCardMotion,
  buildFade,
  buildNumberIn,
  CardMotion,
  PresenceMotion,
} from './motion/age-motion'

export default function AgePage() {
  const today = React.useMemo(() => dayjs().format('YYYY-MM-DD'), [])

  const [birth, setBirth] = React.useState('2000-01-01')
  const [asOf, setAsOf] = React.useState(today)
  const [zodiacBasis, setZodiacBasis] = React.useState<ZodiacBasis>('ipchun')

  const [result, setResult] = React.useState<AgeResult>({
    birth: '',
    asOf: today,
    manAge: null,
    koreanAge: null,
    zodiac: null,
    westernZodiac: null,
    ganji: null,
    error: null,
  })

  const reduceMotion = useReducedMotion()

  const spring: Transition = React.useMemo(() => {
    if (reduceMotion) return { duration: 0 }
    return { type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }
  }, [reduceMotion])

  const cardMotion: CardMotion = React.useMemo(
    () => buildCardMotion(!!reduceMotion, spring),
    [reduceMotion, spring]
  )

  const fade: PresenceMotion = React.useMemo(() => buildFade(), [])

  type NewType = PresenceMotion

  const numberIn: NewType = React.useMemo(() => buildNumberIn(!!reduceMotion), [reduceMotion])

  React.useEffect(() => {
    if (birth.trim() === '') {
      setResult(prev => ({
        ...prev,
        birth: '',
        asOf,
        manAge: null,
        koreanAge: null,
        zodiac: null,
        westernZodiac: null,
        ganji: null,
        error: null,
      }))
      return
    }

    const parsed = ageInputSchema.safeParse({ birth, asOf, zodiacBasis })
    if (!parsed.success) {
      setResult({
        birth,
        asOf,
        manAge: null,
        koreanAge: null,
        zodiac: null,
        westernZodiac: null,
        ganji: null,
        error: parsed.error.issues[0]?.message ?? '입력값이 올바르지 않습니다.',
      })
      return
    }

    const input = parsed.data
    const ages = calcAgeSummary(input.birth, input.asOf)

    const y = Number(input.birth.slice(0, 4))
    const m = Number(input.birth.slice(5, 7))
    const d = Number(input.birth.slice(8, 10))

    const zodiac = calcZodiac(input.birth, input.zodiacBasis)
    const western = calcWesternZodiac(m, d)
    const ganji = Number.isFinite(y) ? calcGanjiYear(y) : null

    setResult({
      birth: input.birth,
      asOf: input.asOf,
      manAge: ages.manAge,
      koreanAge: ages.koreanAge,
      zodiac: {
        label: zodiac.label,
        basis: zodiac.basis,
        appliedYear: zodiac.appliedYear,
        cutoffDate: zodiac.cutoffDate,
        note: zodiac.note,
      },
      westernZodiac: western,
      ganji: isNil(ganji) ? null : ganji,
      error: null,
    })
  }, [birth, asOf, zodiacBasis])

  const resetAll = React.useCallback(() => {
    setBirth('2000-01-01')
    setAsOf(today)
    setZodiacBasis('ipchun')
  }, [today])

  const basisLabel: Record<ZodiacBasis, string> = {
    ipchun: '입춘 기준',
    seollal: '설날(음력 새해) 기준',
    year: '출생년도 기준',
  }

  const showEmpty = result.birth === '' && result.error == null
  const showError = result.error != null
  const hasValues = !showEmpty && !showError

  return (
    <div className={cn('w-full')}>
      <PageHeader
        icon={CalendarDays}
        kicker='Age Calculator'
        title='나이, 띠, 별자리 한눈에 계산하기'
        description='생년월일만 입력하면 만 나이부터 간지까지 바로 확인할 수 있어요.'
      />

      <div className='flex flex-col gap-6'>
        <AgeInputCard
          birth={birth}
          setBirth={setBirth}
          asOf={asOf}
          setAsOf={setAsOf}
          zodiacBasis={zodiacBasis}
          setZodiacBasis={setZodiacBasis}
          onReset={resetAll}
          basisLabel={basisLabel}
        />

        <Card>
          <CardHeader>
            <div className='flex flex-col gap-1'>
              <CardTitle>결과</CardTitle>
              <CardDescription>입력하면 실시간으로 계산돼요.</CardDescription>
            </div>
          </CardHeader>

          <CardContent className='flex flex-col gap-6'>
            <LayoutGroup>
              <motion.div layout transition={spring}>
                <AgeResultGrid
                  result={result}
                  hasValues={hasValues}
                  zodiacBasis={zodiacBasis}
                  basisLabel={basisLabel}
                  cardMotion={cardMotion}
                  spring={spring}
                  numberIn={numberIn}
                />
              </motion.div>

              <AgeResultFooter
                showError={showError}
                showEmpty={showEmpty}
                errorText={result.error}
                birth={result.birth}
                asOf={result.asOf}
                zodiacBasis={zodiacBasis}
                spring={spring}
                fade={fade}
              />
            </LayoutGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
