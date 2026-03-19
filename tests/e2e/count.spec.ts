import { expect, test } from '@playwright/test'

test.describe('/count', () => {
  test('텍스트 입력 후 통계가 갱신되고 비우기로 초기화된다', async ({ page }) => {
    await page.goto('/count')

    const input = page.getByTestId('text-count-input')
    await input.fill('hello\nworld')

    await expect(page.getByTestId('text-count-stats')).toBeVisible()
    await expect(page.getByTestId('text-count-chars-with-spaces')).toContainText('11')
    await expect(page.getByTestId('text-count-words')).toContainText('2')
    await expect(page.getByTestId('text-count-lines')).toContainText('2')

    await page.getByRole('button', { name: '비우기' }).click()

    await expect(input).toHaveValue('')
    await expect(page.getByTestId('text-count-chars-with-spaces')).toContainText('0')
    await expect(page.getByTestId('text-count-words')).toContainText('0')
    await expect(page.getByTestId('text-count-lines')).toContainText('0')
  })
})
