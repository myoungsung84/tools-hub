import { expect, test } from '@playwright/test'

import { freezeBrowserTime } from '../common/freeze-browser-time'
import { setQaSummaryMetadata } from '../common/qa-summary-metadata'

type CalendarEntry = {
  date: string
  name: string
  source: string
  isHoliday: boolean
  kind: string
}

function buildCalendarApiResponse(
  year: number,
  month: number,
  holidays: Record<string, CalendarEntry[]>
) {
  const fetchedAt = '2026-03-19T12:34:56+09:00'

  return {
    success: true as const,
    data: {
      year,
      month,
      holidays,
      fetchedAt,
      meta: {
        cached: false,
        generatedAt: fetchedAt,
        sources: {
          holidays: 'success',
          anniversaries: 'success',
          sundry: 'success',
        },
      },
    },
  }
}

test.describe('/calendar', () => {
  test('mock 응답으로 공휴일/기념일/잡절과 월 이동을 검증한다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        initialMonth: '2026-03',
        actions: ['초기 월 진입', '다음 달 이동'],
      },
      checks: {
        marchEntries: ['테스트 공휴일', '화이트데이', '경칩'],
        nextMonthEntry: '2026.04 / 4월 공휴일',
        apiFlow: '월당 /api/calendar/month 1회 호출',
      },
    })

    await freezeBrowserTime(page, '2026-03-19T12:34:56+09:00')

    const calendarApiRequests: string[] = []

    await page.route('**/api/calendar/**', async route => {
      const url = new URL(route.request().url())
      const year = Number(url.searchParams.get('year'))
      const month = Number(url.searchParams.get('month'))

      calendarApiRequests.push(`${url.pathname}?${url.searchParams.toString()}`)

      const holidays: Record<string, CalendarEntry[]> =
        month === 3
          ? {
              '2026-03-05': [
                {
                  date: '2026-03-05',
                  name: '경칩',
                  source: 'external',
                  isHoliday: false,
                  kind: 'sundry',
                },
              ],
              '2026-03-14': [
                {
                  date: '2026-03-14',
                  name: '화이트데이',
                  source: 'external',
                  isHoliday: false,
                  kind: 'anniversary',
                },
              ],
              '2026-03-19': [
                {
                  date: '2026-03-19',
                  name: '테스트 공휴일',
                  source: 'external',
                  isHoliday: true,
                  kind: 'public',
                },
              ],
            }
          : {
              '2026-04-01': [
                {
                  date: '2026-04-01',
                  name: '4월 공휴일',
                  source: 'external',
                  isHoliday: true,
                  kind: 'public',
                },
              ],
            }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildCalendarApiResponse(year, month, holidays)),
      })
    })

    await page.goto('/calendar')

    const grid = page.getByTestId('calendar-grid')
    await expect(grid).toContainText('테스트 공휴일')
    await expect(grid).toContainText('화이트데이')
    await expect(grid).toContainText('경칩')
    expect(calendarApiRequests).toEqual(['/api/calendar/month?year=2026&month=3'])

    await page.getByLabel('다음 달').click()
    await expect(page.getByText('2026.04')).toBeVisible()
    await expect(grid).toContainText('4월 공휴일')
    expect(calendarApiRequests).toEqual([
      '/api/calendar/month?year=2026&month=3',
      '/api/calendar/month?year=2026&month=4',
    ])
  })
})
