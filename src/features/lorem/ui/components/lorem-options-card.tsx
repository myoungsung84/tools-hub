import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import {
  DENSITY_LABEL,
  LANGUAGE_LABEL,
  PARAGRAPH_COUNT_OPTIONS,
  SENTENCE_LENGTH_LABEL,
} from '../../lib/constants'
import type { Density, Language, SentenceLength } from '../../lib/types'

type LoremOptionsCardProps = {
  language: Language
  paragraphCount: number
  density: Density
  sentenceLength: SentenceLength
  lineBreak: boolean
  onLanguageChange: (value: Language) => void
  onParagraphCountChange: (value: number) => void
  onDensityChange: (value: Density) => void
  onSentenceLengthChange: (value: SentenceLength) => void
  onLineBreakChange: (value: boolean) => void
}

export default function LoremOptionsCard({
  language,
  paragraphCount,
  density,
  sentenceLength,
  lineBreak,
  onLanguageChange,
  onParagraphCountChange,
  onDensityChange,
  onSentenceLengthChange,
  onLineBreakChange,
}: LoremOptionsCardProps) {
  return (
    <Card className='border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background'>
      <CardHeader>
        <CardTitle>생성 옵션</CardTitle>
        <CardDescription>옵션을 변경하면 텍스트가 바로 업데이트됩니다.</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-2'>
          <Badge variant='secondary' className='text-xs font-normal'>
            {LANGUAGE_LABEL[language]}
          </Badge>
          <span className='text-muted-foreground/40 text-xs'>·</span>
          <Badge variant='outline' className='text-xs font-normal'>
            {paragraphCount}문단
          </Badge>
          <span className='text-muted-foreground/40 text-xs'>·</span>
          <Badge variant='outline' className='text-xs font-normal'>
            밀도 {DENSITY_LABEL[density]}
          </Badge>
          <span className='text-muted-foreground/40 text-xs'>·</span>
          <Badge variant='outline' className='text-xs font-normal'>
            문장 {SENTENCE_LENGTH_LABEL[sentenceLength]}
          </Badge>
          <span className='text-muted-foreground/40 text-xs'>·</span>
          <Badge
            variant={lineBreak ? 'secondary' : 'outline'}
            className='text-xs font-normal text-muted-foreground'
          >
            줄바꿈 {lineBreak ? 'ON' : 'OFF'}
          </Badge>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='language'>언어</Label>
            <Select value={language} onValueChange={value => onLanguageChange(value as Language)}>
              <SelectTrigger id='language' className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ko'>한국어</SelectItem>
                <SelectItem value='en'>English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='paragraph-count'>문단 수</Label>
            <Select
              value={String(paragraphCount)}
              onValueChange={value => onParagraphCountChange(Number(value))}
            >
              <SelectTrigger id='paragraph-count' className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARAGRAPH_COUNT_OPTIONS.map(value => (
                  <SelectItem key={value} value={String(value)}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='density'>밀도</Label>
            <Select value={density} onValueChange={value => onDensityChange(value as Density)}>
              <SelectTrigger id='density' className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='low'>낮음</SelectItem>
                <SelectItem value='normal'>보통</SelectItem>
                <SelectItem value='high'>높음</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='sentence-length'>문장 길이</Label>
            <Select
              value={sentenceLength}
              onValueChange={value => onSentenceLengthChange(value as SentenceLength)}
            >
              <SelectTrigger id='sentence-length' className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='short'>짧음</SelectItem>
                <SelectItem value='medium'>중간</SelectItem>
                <SelectItem value='long'>김</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex items-center justify-between rounded-lg border px-4 py-3'>
          <div className='space-y-0.5'>
            <Label htmlFor='line-break'>문장 줄바꿈</Label>
            <p className='text-muted-foreground text-xs'>
              {lineBreak
                ? '문단 내 문장을 줄바꿈으로 구분합니다.'
                : '문단 내 문장을 공백으로 이어 씁니다.'}
            </p>
          </div>
          <Switch id='line-break' checked={lineBreak} onCheckedChange={onLineBreakChange} />
        </div>
      </CardContent>
    </Card>
  )
}
