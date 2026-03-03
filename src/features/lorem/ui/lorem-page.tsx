'use client'

import { FileText } from 'lucide-react'
import * as React from 'react'
import { toast, Toaster } from 'sonner'

import PageHeader from '@/components/layout/page-header'
import { cn } from '@/lib/shared'

import { analyzeLoremOutput, generateLoremText } from '../lib/generator'
import type { Density, Language, SentenceLength } from '../lib/types'
import LoremOptionsCard from './components/lorem-options-card'
import LoremResultCard from './components/lorem-result-card'

export default function LoremPage() {
  const [language, setLanguage] = React.useState<Language>('ko')
  const [paragraphCount, setParagraphCount] = React.useState(4)
  const [density, setDensity] = React.useState<Density>('high')
  const [sentenceLength, setSentenceLength] = React.useState<SentenceLength>('medium')
  const [lineBreak, setLineBreak] = React.useState(false)
  const [refreshTick, setRefreshTick] = React.useState(0)
  const [output, setOutput] = React.useState('')

  const outputStats = React.useMemo(() => analyzeLoremOutput(output), [output])

  const numberFormatter = React.useMemo(
    () => new Intl.NumberFormat(language === 'ko' ? 'ko-KR' : 'en-US'),
    [language]
  )

  React.useEffect(() => {
    setOutput(generateLoremText({ language, paragraphCount, density, sentenceLength, lineBreak }))
  }, [language, paragraphCount, density, sentenceLength, lineBreak, refreshTick])

  const onCopy = async () => {
    if (!output.trim()) return

    try {
      await navigator.clipboard.writeText(output)
      toast.success('복사되었습니다.')
    } catch {
      toast.error('복사하지 못했습니다. 다시 시도해 주세요.')
    }
  }

  return (
    <div className={cn('w-full')}>
      <PageHeader
        icon={FileText}
        kicker='더미 텍스트'
        title='현대 서정 산문 더미 생성기'
        description='랜덤 조합으로 한국어/영어 더미 텍스트를 생성합니다.'
      />
      <div className='flex w-full flex-col gap-6'>
        <LoremOptionsCard
          language={language}
          paragraphCount={paragraphCount}
          density={density}
          sentenceLength={sentenceLength}
          lineBreak={lineBreak}
          onLanguageChange={setLanguage}
          onParagraphCountChange={setParagraphCount}
          onDensityChange={setDensity}
          onSentenceLengthChange={setSentenceLength}
          onLineBreakChange={setLineBreak}
        />

        <LoremResultCard
          output={output}
          stats={outputStats}
          numberFormatter={numberFormatter}
          onRefresh={() => setRefreshTick(prev => prev + 1)}
          onCopy={onCopy}
        />

        <Toaster richColors position='bottom-center' />
      </div>
    </div>
  )
}
