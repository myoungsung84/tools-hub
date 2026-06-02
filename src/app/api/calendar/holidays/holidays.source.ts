import { uniqBy } from 'lodash-es'

import { fetchSpcdeInfo, toIsoDate } from '../_shared/spcde-fetch'

export type ExternalHolidayItem = {
  date: string
  name: string
  isHoliday: boolean
  kind: 'public'
}

export async function fetchCalendarHolidaysExternal(params: {
  year: number
  month: number
  revalidateSec?: number
}): Promise<ExternalHolidayItem[]> {
  const { year, month } = params

  const items = await fetchSpcdeInfo({
    endpoint: 'getRestDeInfo',
    year,
    month,
    revalidateSec: params.revalidateSec,
  })

  const out: ExternalHolidayItem[] = []
  for (const it of items) {
    const date = it.locdate != null ? toIsoDate(it.locdate) : null
    const name = it.dateName?.trim()
    if (!date || !name) continue

    out.push({
      date,
      name,
      isHoliday: String(it.isHoliday ?? 'Y').toUpperCase() === 'Y',
      kind: 'public',
    })
  }

  const unique = uniqBy(out, v => `${v.date}::${v.name}::${v.kind}`)

  return unique
}
