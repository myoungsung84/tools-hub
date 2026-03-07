import { Loader2, Search } from 'lucide-react'
import type { FormEvent, RefObject } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { IP_LOOKUP_PLACEHOLDER } from '../../lib/ip-lookup.constants'

type Props = {
  ipInput: string
  isLoading: boolean
  inputRef: RefObject<HTMLInputElement | null>
  onChange: (value: string) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export default function IpLookupFormCard({
  ipInput,
  isLoading,
  inputRef,
  onChange,
  onSubmit,
}: Props) {
  return (
    <Card className='lg:col-span-2'>
      <CardHeader>
        <CardTitle>IP 주소 조회</CardTitle>
        <CardDescription>
          IPv4 또는 IPv6 주소를 입력하세요. 사설 IP는 위치 정보를 제공하지 않습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='flex flex-col gap-2 sm:flex-row'>
          <Input
            ref={inputRef}
            value={ipInput}
            onChange={e => onChange(e.target.value)}
            placeholder={IP_LOOKUP_PLACEHOLDER}
            className='flex-1 font-mono'
            disabled={isLoading}
            aria-label='IP 주소 입력'
          />
          <Button type='submit' disabled={isLoading} className='shrink-0'>
            {isLoading ? <Loader2 className='size-4 animate-spin' /> : <Search className='size-4' />}
            {isLoading ? '조회 중...' : '조회하기'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
