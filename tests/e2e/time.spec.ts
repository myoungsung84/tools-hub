import { expect, test } from '@playwright/test'

import { freezeBrowserTime } from '../common/freeze-browser-time'
import { setQaSummaryMetadata } from '../common/qa-summary-metadata'

test.describe('/time', () => {
  test('고정된 시간 기준으로 메인 시계와 세계 시간이 렌더링된다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        fixedDate: '2026-03-19T12:34:56+09:00',
      },
      checks: {
        mainClock: 'PM 12:34:56',
        dateLabel: '2026년 3월 19일',
        worldClocks: ['뉴욕', '도쿄', '시드니'],
      },
    })

    await freezeBrowserTime(page, '2026-03-19T12:34:56+09:00')
    await page.goto('/time')

    await expect(page.getByTestId('time-meridiem')).toContainText('PM')
    await expect(page.getByTestId('time-hour')).toHaveText('12')
    await expect(page.getByTestId('time-minute')).toHaveText('34')
    await expect(page.getByTestId('time-second')).toHaveText('56')
    await expect(page.getByTestId('time-date')).toContainText('2026년 3월 19일')

    const subClocks = page.getByTestId('time-sub-clocks')
    await expect(subClocks).toContainText('뉴욕')
    await expect(subClocks).toContainText('도쿄')
    await expect(subClocks).toContainText('시드니')
  })
})
