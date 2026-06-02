import { uniqBy } from 'lodash-es'

import { fetchSpcdeInfo, toIsoDate } from '../_shared/spcde-fetch'

export type ExternalSundryItem = {
  date: string
  name: string
  isHoliday: boolean
  kind: 'sundry'
}

export async function fetchCalendarSundryExternal(params: {
  year: number
  month: number
  revalidateSec?: number
}): Promise<ExternalSundryItem[]> {
  const { year, month } = params

  const items = await fetchSpcdeInfo({
    endpoint: 'getSundryDayInfo',
    year,
    month,
    revalidateSec: params.revalidateSec,
  })

  const out: ExternalSundryItem[] = []
  for (const it of items) {
    const date = it.locdate != null ? toIsoDate(it.locdate) : null
    const name = it.dateName?.trim()
    if (!date || !name) continue

    out.push({
      date,
      name,
      isHoliday: String(it.isHoliday ?? 'N').toUpperCase() === 'Y',
      kind: 'sundry',
    })
  }

  const unique = uniqBy(out, v => `${v.date}::${v.name}::${v.kind}`)

  return unique
}
