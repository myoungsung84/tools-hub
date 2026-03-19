import { expect, test } from '@playwright/test'

import { setQaSummaryMetadata } from '../common/qa-summary-metadata'

test.describe('/qr', () => {
  test('텍스트 입력 후 실제 QR 이미지가 생성된다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        inputText: 'https://tools-hub.local/qa',
      },
      checks: {
        expectedImageSrc: 'data:image/png;base64,...',
      },
    })

    await page.goto('/qr')

    await page.getByTestId('qr-text-input').fill('https://tools-hub.local/qa')

    const preview = page.getByTestId('qr-preview')
    const image = page.getByTestId('qr-preview-image')

    await expect(preview).toBeVisible()
    await expect(image).toBeVisible()
    await expect(image).toHaveAttribute('src', /^data:image\/png;base64,/)
  })
})
