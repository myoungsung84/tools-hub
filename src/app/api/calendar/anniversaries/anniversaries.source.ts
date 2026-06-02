import { uniqBy } from 'lodash-es'

import { fetchSpcdeInfo, toIsoDate } from '../_shared/spcde-fetch'

export type ExternalAnniversaryItem = {
  date: string
  name: string
  isHoliday: boolean
  kind: 'anniversary'
}

export async function fetchCalendarAnniversariesExternal(params: {
  year: number
  month: number
  revalidateSec?: number
}): Promise<ExternalAnniversaryItem[]> {
  const { year, month } = params

  const items = await fetchSpcdeInfo({
    endpoint: 'getAnniversaryInfo',
    year,
    month,
    revalidateSec: params.revalidateSec,
  })

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

  return unique
}
