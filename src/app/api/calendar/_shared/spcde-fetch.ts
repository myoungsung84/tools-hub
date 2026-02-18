import { ApiErrors } from '@/lib/server'

export type DataGoKrItem = {
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

export function toIsoDate(locdate: string | number): string | null {
  const raw = String(locdate).trim()
  if (!/^\d{8}$/.test(raw)) return null
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}

export async function fetchSpcdeInfo(params: {
  endpoint: 'getRestDeInfo' | 'getAnniversaryInfo' | 'getSundryDayInfo'
  year: number
  month: number
  numOfRows?: number
}): Promise<DataGoKrItem[]> {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY
  if (!serviceKey) throw ApiErrors.internal('DATA_GO_KR_SERVICE_KEY is missing')

  const baseUrl =
    process.env.DATA_GO_KR_SPCDE_BASE_URL ??
    'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService'

  const url = new URL(`${baseUrl}/${params.endpoint}`)
  url.searchParams.set('serviceKey', serviceKey)
  url.searchParams.set('solYear', String(params.year))
  url.searchParams.set('solMonth', String(params.month).padStart(2, '0'))
  url.searchParams.set('pageNo', '1')
  url.searchParams.set('numOfRows', String(params.numOfRows ?? 200))
  url.searchParams.set('_type', 'json')

  let res: Response
  try {
    res = await fetch(url)
  } catch {
    throw ApiErrors.upstream('data.go.kr fetch failed')
  }

  if (!res.ok) {
    throw ApiErrors.upstream(`data.go.kr bad response: ${res.status}`)
  }

  let json: DataGoKrResponse
  try {
    json = (await res.json()) as DataGoKrResponse
  } catch {
    throw ApiErrors.upstream('data.go.kr json parse failed')
  }

  const resultCode = json.response?.header?.resultCode
  if (resultCode !== '00') {
    const msg = json.response?.header?.resultMsg ?? 'unknown'
    throw ApiErrors.upstream(`data.go.kr error: ${resultCode ?? 'undefined'} ${msg}`)
  }

  const item = json.response?.body?.items?.item
  if (Array.isArray(item)) return item
  if (item) return [item]
  return []
}
