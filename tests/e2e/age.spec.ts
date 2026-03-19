import { expect, test } from '@playwright/test'

import { setQaSummaryMetadata } from '../common/qa-summary-metadata'

test.describe('/age', () => {
  test('생년월일과 기준일 입력 후 핵심 결과가 비어 있지 않게 렌더링된다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        birthDate: '1994-06-14',
        asOfDate: '2026-03-19',
      },
      checks: {
        expectedAge: '만 31세, 한국 나이 33세',
      },
    })

    await page.goto('/age')

    await page.getByLabel('🎂 생년월일').fill('1994-06-14')
    await page.getByLabel('📆 기준일').fill('2026-03-19')

    const resultGrid = page.getByTestId('age-result-grid')
    await expect(resultGrid).toBeVisible()

    const manAge = page.getByTestId('age-result-man-age')
    const koreanAge = page.getByTestId('age-result-korean-age')

    await expect(manAge).toContainText('31')
    await expect(koreanAge).toContainText('33')
  })
})
