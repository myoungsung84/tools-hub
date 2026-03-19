import { expect, test } from '@playwright/test'

test.describe('/lorem', () => {
  test('초기 더미 텍스트가 생성되고 새로 생성으로 결과가 바뀐다', async ({ page }) => {
    await page.goto('/lorem')

    const output = page.getByTestId('lorem-output')
    await expect(output).toBeVisible()
    await expect(output).not.toHaveValue('')

    const initialValue = await output.inputValue()
    expect(initialValue.trim().length).toBeGreaterThan(0)

    await page.getByRole('button', { name: '새로 생성' }).click()

    await expect(output).not.toHaveValue(initialValue)
    await expect(output).not.toHaveValue('')
  })
})
