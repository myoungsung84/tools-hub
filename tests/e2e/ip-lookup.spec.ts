import { expect, test } from '@playwright/test'

import { setQaSummaryMetadata } from '../common/qa-summary-metadata'

const mockSuccessResponse = {
  success: true as const,
  data: {
    ip: '8.8.8.8',
    isPrivate: false,
    geo: {
      country: 'US',
      countryName: 'United States',
      region: 'California',
      city: 'Mountain View',
      lat: 37.4056,
      lon: -122.0775,
      timezone: 'America/Los_Angeles',
      accuracyRadiusKm: 20,
      updatedText: '2026-03-01',
    },
    asn: {
      asn: 15169,
      org: 'Google LLC',
      updatedText: '2026-03-01',
    },
  },
}

const mockPrivateResponse = {
  success: true as const,
  data: {
    ip: '192.168.0.1',
    isPrivate: true,
    geo: null,
    asn: null,
  },
}

const mockNoMapResponse = {
  success: true as const,
  data: {
    ip: '203.0.113.10',
    isPrivate: false,
    geo: {
      country: 'KR',
      countryName: 'South Korea',
      region: 'Seoul',
      city: 'Seoul',
      lat: null,
      lon: null,
      timezone: 'Asia/Seoul',
      accuracyRadiusKm: 30,
      updatedText: '2026-03-01',
    },
    asn: {
      asn: 4766,
      org: 'KT',
      updatedText: '2026-03-01',
    },
  },
}

test.describe('/ip-lookup', () => {
  test('정상 조회 시 요약과 위치 정보가 렌더링된다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        mockCase: 'success',
        ip: '8.8.8.8',
      },
      checks: {
        summary: '8.8.8.8',
        location: 'Mountain View',
        map: '렌더링됨',
      },
    })

    await page.route('**/api/ip', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSuccessResponse),
      })
    })

    await page.goto('/ip-lookup')
    await page.getByLabel('IP 주소 입력').fill('8.8.8.8')
    await page.getByRole('button', { name: '조회하기' }).click()

    await expect(page.getByTestId('ip-lookup-summary')).toBeVisible()
    await expect(page.getByTestId('ip-lookup-location')).toBeVisible()
    await expect(page.getByTestId('ip-lookup-map')).toBeVisible()
    await expect(page.getByTestId('ip-lookup-summary')).toContainText('8.8.8.8')
    await expect(page.getByTestId('ip-lookup-location')).toContainText('Mountain View')
  })

  test('사설 IP 조회 시 지도 대신 사설 IP 안내가 표시된다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        mockCase: 'private-ip',
        ip: '192.168.0.1',
      },
      checks: {
        summary: '사설 (Private)',
        notice: '사설 IP 주소 / 지도를 표시할 수 없습니다.',
      },
    })

    await page.route('**/api/ip', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPrivateResponse),
      })
    })

    await page.goto('/ip-lookup')
    await page.getByLabel('IP 주소 입력').fill('192.168.0.1')
    await page.getByRole('button', { name: '조회하기' }).click()

    await expect(page.getByTestId('ip-lookup-summary')).toContainText('사설 (Private)')
    await expect(page.getByText('사설 IP 주소')).toBeVisible()
    await expect(page.getByText('지도를 표시할 수 없습니다.')).toBeVisible()
  })

  test('좌표 없는 공인 IP 응답에서는 지도 카드가 렌더링되지 않는다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        mockCase: 'public-ip-no-map',
        ip: '203.0.113.10',
      },
      checks: {
        location: 'Seoul',
        map: '미노출',
      },
    })

    await page.route('**/api/ip', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockNoMapResponse),
      })
    })

    await page.goto('/ip-lookup')
    await page.getByLabel('IP 주소 입력').fill('203.0.113.10')
    await page.getByRole('button', { name: '조회하기' }).click()

    await expect(page.getByTestId('ip-lookup-location')).toContainText('Seoul')
    await expect(page.getByTestId('ip-lookup-map')).toHaveCount(0)
  })

  test('업스트림 실패 응답 시 에러 상태가 노출된다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        mockCase: 'upstream-error',
        ip: '8.8.4.4',
      },
      checks: {
        errorMessage: '업스트림 조회 실패',
      },
    })

    await page.route('**/api/ip', async route => {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            message: '업스트림 조회 실패',
          },
        }),
      })
    })

    await page.goto('/ip-lookup')
    await page.getByLabel('IP 주소 입력').fill('8.8.4.4')
    await page.getByRole('button', { name: '조회하기' }).click()

    await expect(page.getByTestId('ip-lookup-error')).toContainText('업스트림 조회 실패')
  })

  test('잘못된 입력 시 에러 상태가 노출된다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        mockCase: 'invalid-input',
        ip: 'not-an-ip',
      },
      checks: {
        errorMessage: '유효한 IP 주소를 입력해 주세요.',
      },
    })

    await page.goto('/ip-lookup')
    await page.getByLabel('IP 주소 입력').fill('not-an-ip')
    await page.getByRole('button', { name: '조회하기' }).click()

    const errorAlert = page.getByTestId('ip-lookup-error')
    await expect(errorAlert).toBeVisible()
    await expect(errorAlert).toContainText('유효한 IP 주소를 입력해 주세요.')
  })
})
