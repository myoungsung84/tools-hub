import { expect, test } from '@playwright/test'

import { freezeBrowserTime } from '../common/freeze-browser-time'

function buildWeatherNow(tempC: number, label: string, fetchedAt = '2026-03-19T12:34:56+09:00') {
  return {
    success: true as const,
    data: {
      tempC,
      feelsLikeC: tempC - 1,
      windMs: 3.4,
      code: 1,
      label,
      locationLabel: 'mock',
      fetchedAt,
    },
  }
}

function buildHourlyResponse(timezone: string) {
  return {
    success: true as const,
    data: {
      locationLabel: 'mock',
      timezone,
      fetchedAt: '2026-03-19T12:34:56+09:00',
      points: Array.from({ length: 12 }, (_, index) => ({
        time: Math.floor(new Date(`2026-03-19T0${index}:00:00+09:00`).getTime() / 1000),
        temperature: 12 + index,
        code: 1,
        condition: '맑음',
        precipitationProbability: index * 5,
        windSpeed: 2 + index * 0.2,
      })),
    },
  }
}

test.describe('/weather', () => {
  test('mock 응답으로 메인 날씨, 차트, 도시 전환을 검증한다', async ({ page }) => {
    await freezeBrowserTime(page, '2026-03-19T12:34:56+09:00')

    await page.route('**/api/weather/now**', async route => {
      const url = new URL(route.request().url())
      const locationLabel = url.searchParams.get('locationLabel') ?? ''

      const tempMap: Record<string, { temp: number; label: string }> = {
        서울: { temp: 21, label: '맑음' },
        도쿄: { temp: 18, label: '구름 많음' },
        싱가포르: { temp: 30, label: '비' },
        런던: { temp: 10, label: '흐림' },
        뉴욕: { temp: 8, label: '눈' },
        시드니: { temp: 24, label: '맑음' },
      }

      const matched = tempMap[locationLabel] ?? { temp: 15, label: '흐림' }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildWeatherNow(matched.temp, matched.label)),
      })
    })

    await page.route('**/api/weather/hourly**', async route => {
      const url = new URL(route.request().url())
      const timezone = url.searchParams.get('timezone') ?? 'Asia/Seoul'

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildHourlyResponse(timezone)),
      })
    })

    await page.goto('/weather')

    const mainPanel = page.getByTestId('weather-main-panel')
    await expect(mainPanel).toContainText('서울')
    await expect(mainPanel).toContainText('21')
    await expect(mainPanel).toContainText('맑음')

    await expect(page.getByTestId('weather-hourly-panel')).toBeVisible()
    await page.getByRole('button', { name: '강수확률' }).click()
    await expect(page.getByTestId('weather-hourly-panel')).toContainText('시간별 예보')

    await page
      .getByRole('navigation', { name: '주요 도시' })
      .getByRole('button', { name: /도쿄/ })
      .click()
    await expect(mainPanel).toContainText('도쿄')
    await expect(mainPanel).toContainText('18')

    const citiesPanel = page.getByTestId('weather-cities-panel')
    await expect(citiesPanel).toContainText('런던')
    await expect(citiesPanel).toContainText('뉴욕')
  })
})
