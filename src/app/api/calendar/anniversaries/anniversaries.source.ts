import { isNil, uniqBy } from 'lodash-es'

import { cacheGetJson, cacheSetJson } from '@/lib/server/cache'

import { fetchSpcdeInfo, toIsoDate } from '../_shared/spcde-fetch'

export type ExternalAnniversaryItem = {
  date: string
  name: string
  isHoliday: boolean
  kind: 'anniversary'
}

function cacheKey(year: number, month: number) {
  return `calendar:anniversaries:v1:${year}-${String(month).padStart(2, '0')}`
}

export async function fetchCalendarAnniversariesExternal(params: {
  year: number
  month: number
  revalidateSec?: number
}): Promise<ExternalAnniversaryItem[]> {
  const { year, month } = params
  const ttlSec = params.revalidateSec ?? 60 * 60 * 12
  const key = cacheKey(year, month)

  const cached = await cacheGetJson<ExternalAnniversaryItem[]>(key)
  if (!isNil(cached)) return cached

  const items = await fetchSpcdeInfo({ endpoint: 'getAnniversaryInfo', year, month })

  const out: ExternalAnniversaryItem[] = []
  for (const it of items) {
    const date = it.locdate != null ? toIsoDate(it.locdate) : null
    const name = it.dateName?.trim()
    if (!date || !name) continue

    out.push({
      date,
      name,
      isHoliday: String(it.isHoliday ?? 'N').toUpperCase() === 'Y',
      kind: 'anniversary',
    })
  }

  const unique = uniqBy(out, v => `${v.date}::${v.name}::${v.kind}`)

  await cacheSetJson(key, unique, ttlSec)
  return unique
}
