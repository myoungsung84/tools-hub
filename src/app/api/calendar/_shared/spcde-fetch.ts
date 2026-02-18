import dayjs from 'dayjs'

import { ApiErrors } from '@/lib/server'

type DataGoKrItem = {
  locdate?: number | string
  dateName?: string
  isHoliday?: 'Y' | 'N' | string
}

type DataGoKrResponse = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string }
    body?: { items?: { item?: DataGoKrItem | DataGoKrItem[] } }
  }
}

export function toIsoDate(locdate: string | number) {
  const raw = String(locdate).trim()
  if (!/^\d{8}$/.test(raw)) return null
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}

export async function fetchSpcdeInfo(params: {
  endpoint: 'getRestDeInfo' | 'getAnniversaryInfo' | 'getSundryDayInfo'
  year: number
  month: number
  numOfRows?: number
}) {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY
  if (!serviceKey) throw ApiErrors.internal('DATA_GO_KR_SERVICE_KEY is missing')

  const baseUrl =
    process.env.DATA_GO_KR_SPCDE_BASE_URL ??
    'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService'

  const solYear = String(params.year)
  const solMonth = String(params.month).padStart(2, '0')

  const url =
    `${baseUrl}/${params.endpoint}` +
    `?serviceKey=${encodeURIComponent(serviceKey)}` +
    `&solYear=${solYear}` +
    `&solMonth=${solMonth}` +
    `&numOfRows=${params.numOfRows ?? 200}` +
    `&pageNo=1` +
    `&_type=json`

  const requestedAtIso = dayjs().toISOString()

  let res: Response
  try {
    res = await fetch(url)
  } catch {
    throw ApiErrors.upstream(`data.go.kr fetch failed (${requestedAtIso})`)
  }

  if (!res.ok) {
    throw ApiErrors.upstream(`data.go.kr bad response: ${res.status} (${requestedAtIso})`)
  }

  let json: DataGoKrResponse
  try {
    json = (await res.json()) as DataGoKrResponse
  } catch {
    throw ApiErrors.upstream(`data.go.kr json parse failed (${requestedAtIso})`)
  }

  const resultCode = json.response?.header?.resultCode
  if (resultCode && resultCode !== '00') {
    const msg = json.response?.header?.resultMsg ?? 'unknown'
    throw ApiErrors.upstream(`data.go.kr error: ${resultCode} ${msg} (${requestedAtIso})`)
  }

  const item = json.response?.body?.items?.item
  return Array.isArray(item) ? item : item ? [item] : []
}
