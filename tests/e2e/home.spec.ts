import { expect, test } from '@playwright/test'

test.describe('home routes', () => {
  test('루트 홈에서 주요 도구 링크가 보인다', async ({ page }) => {
    await page.goto('/')

    const grid = page.getByTestId('home-tools-grid')
    await expect(grid).toBeVisible()

    await expect(page.getByRole('link', { name: /현재시간/i })).toHaveAttribute('href', '/time')
    await expect(page.getByRole('link', { name: /세계 날씨/i })).toHaveAttribute('href', '/weather')
    await expect(page.getByRole('link', { name: /단위 변환기/i })).toHaveAttribute(
      'href',
      '/unit-converter'
    )
  })

  test('/home 경로는 루트로 리다이렉트된다', async ({ page }) => {
    await page.goto('/home')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByTestId('home-tools-grid')).toBeVisible()
  })
})
