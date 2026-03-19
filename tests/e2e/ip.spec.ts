import { expect, test } from '@playwright/test'

const publicIpResponse = {
  success: true as const,
  data: {
    ip: '203.0.113.7',
    isPrivate: false,
    geo: {
      country: 'KR',
      countryName: '대한민국',
      region: '서울',
      city: '서울',
      lat: 37.5665,
      lon: 126.978,
      timezone: 'Asia/Seoul',
      accuracyRadiusKm: 20,
    },
    asn: {
      asn: 9318,
      org: 'SK Broadband',
    },
    ua: {
      raw: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      browser: 'Safari',
      os: 'macOS',
      isMobile: false,
    },
  },
}

const privateIpResponse = {
  success: true as const,
  data: {
    ip: '192.168.0.10',
    isPrivate: true,
    geo: null,
    asn: null,
    ua: {
      raw: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
      browser: 'Safari',
      os: 'iOS',
      isMobile: true,
    },
  },
}

test.describe('/ip', () => {
  test('공인 IP 응답을 받아 위치와 네트워크 정보를 렌더링한다', async ({ page }) => {
    await page.route('**/api/ip', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(publicIpResponse),
      })
    })

    await page.goto('/ip')

    const ipPage = page.getByTestId('ip-page')
    await expect(ipPage).toContainText('203.0.113.7')
    await expect(ipPage).toContainText('접속 위치:')
    await expect(ipPage).toContainText('대한민국 (KR)')
    await expect(ipPage).toContainText('SK Broadband')
    await expect(ipPage).toContainText('Safari on macOS')
  })

  test('사설 IP 응답에서는 로컬 환경 안내를 보여준다', async ({ page }) => {
    await page.route('**/api/ip', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(privateIpResponse),
      })
    })

    await page.goto('/ip')

    const ipPage = page.getByTestId('ip-page')
    await expect(ipPage).toContainText('192.168.0.10')
    await expect(ipPage).toContainText('로컬/사설 IP 환경에서 접속 중입니다.')
    await expect(ipPage).toContainText('Private')
    await expect(ipPage).toContainText('Safari on iOS')
  })
})
