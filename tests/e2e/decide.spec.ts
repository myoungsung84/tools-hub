import { expect, test } from '@playwright/test'

test.describe('/decide', () => {
  test('룰렛을 돌린 뒤 최종 결정 상태가 표시된다', async ({ page }) => {
    test.setTimeout(15_000)

    await page.goto('/decide')

    const headline = page.getByTestId('decide-headline')
    await expect(headline).toHaveText('결정 대기')

    await page.getByRole('button', { name: '운명에 맡기기' }).click()

    await expect(headline).toHaveText('결정 중…')
    await expect(page.getByRole('button', { name: '다시 돌리기' })).toBeVisible()
    await expect(headline).not.toHaveText('결정 중…')
  })
})
