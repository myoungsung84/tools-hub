import { expect, test } from '@playwright/test'
import dayjs from 'dayjs'

import { freezeBrowserTime } from '../common/freeze-browser-time'
import { setQaSummaryMetadata } from '../common/qa-summary-metadata'

function buildWeatherNowMany(fetchedAt = '2026-03-19T12:34:56+09:00') {
  const cityData: Record<string, { temp: number; label: string; locationLabel: string }> = {
    seoul: { temp: 21, label: '맑음', locationLabel: '서울' },
    tokyo: { temp: 18, label: '구름 많음', locationLabel: '도쿄' },
    singapore: { temp: 30, label: '비', locationLabel: '싱가포르' },
    beijing: { temp: 15, label: '흐림', locationLabel: '베이징' },
    mumbai: { temp: 28, label: '맑음', locationLabel: '뭄바이' },
    dubai: { temp: 32, label: '맑음', locationLabel: '두바이' },
    london: { temp: 10, label: '흐림', locationLabel: '런던' },
    moscow: { temp: 5, label: '눈', locationLabel: '모스크바' },
    'new-york': { temp: 8, label: '눈', locationLabel: '뉴욕' },
    'los-angeles': { temp: 20, label: '맑음', locationLabel: 'LA' },
    'sao-paulo': { temp: 25, label: '비', locationLabel: '상파울루' },
    sydney: { temp: 24, label: '맑음', locationLabel: '시드니' },
    cairo: { temp: 28, label: '맑음', locationLabel: '카이로' },
  }

  const items: Record<string, object> = {}
  for (const [id, data] of Object.entries(cityData)) {
    items[id] = {
      tempC: data.temp,
      feelsLikeC: data.temp - 1,
      windMs: 3.4,
      code: 1,
      label: data.label,
      locationLabel: data.locationLabel,
    }
  }

  return {
    success: true as const,
    data: { fetchedAt, items },
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
        time: dayjs('2026-03-19T00:00:00+09:00').hour(index).unix(),
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
  test('mock 응답으로 메인 날씨, 차트, 도시 전환을 검증한다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        city: '서울 -> 도쿄',
        fixedDate: '2026-03-19T12:34:56+09:00',
      },
      checks: {
        initialWeather: '서울, 21도, 맑음',
        switchedWeather: '도쿄, 18도',
        hourlyPanel: '시간별 예보 / 강수확률 탭 전환',
      },
    })

    await freezeBrowserTime(page, '2026-03-19T12:34:56+09:00')

    await page.route('**/api/weather/now-many**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(buildWeatherNowMany()),
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
