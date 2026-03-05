import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TextTipsCard() {
  return (
    <Card className='flex flex-1 flex-col border-zinc-800 bg-zinc-900/50'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-zinc-100'>팁</CardTitle>
        <CardDescription className='text-zinc-400'>
          {`자주 쓰는 기준은 "프리셋"으로 묶어두면 더 편해져요.`}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 text-sm text-zinc-400'>
        <ul className='list-disc space-y-1.5 pl-5'>
          <li>
            자소서/지원서: <span className='font-medium text-zinc-200'>현재 X자 / 제한 Y자</span> 표시
          </li>
          <li>
            SNS: 트위터(X) <span className='font-medium text-zinc-200'>280자</span> 같은 제한 관리
          </li>
          <li>
            바이트: 문자(SMS/LMS)처럼 <span className='font-medium text-zinc-200'>용량 제한</span>{' '}
            계산에 유용
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
