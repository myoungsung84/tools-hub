import { expect, test } from '@playwright/test'

test.describe('/animal-race', () => {
  test('레이스를 시작하면 최종 순위 결과가 표시된다', async ({ page }) => {
    test.setTimeout(30_000)

    await page.goto('/animal-race')

    await page.getByRole('button', { name: '4', exact: true }).click()
    await page.getByRole('button', { name: '시작', exact: true }).click()

    const result = page.getByTestId('animal-race-result')
    await expect(result).toContainText('최종 순위가 확정되었습니다', { timeout: 25_000 })
    await expect(result).toContainText('경기 결과')
    await expect(result.getByRole('button', { name: '다시 시작', exact: true })).toBeVisible()
  })
})
