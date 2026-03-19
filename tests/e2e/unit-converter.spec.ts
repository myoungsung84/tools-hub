import { expect, test } from '@playwright/test'

import { setQaSummaryMetadata } from '../common/qa-summary-metadata'

async function pickCategory(page: import('@playwright/test').Page, categoryName: string) {
  await page.getByRole('button', { name: categoryName, exact: true }).click()
}

async function pickUnit(page: import('@playwright/test').Page, unitName: string) {
  await page.getByRole('button', { name: unitName, exact: true }).click()
}

test.describe('/unit-converter', () => {
  test('길이 카테고리에서 미터 기준 결과가 갱신된다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        category: '길이',
        input: '1',
        fromUnit: '미터 m',
      },
      checks: {
        expectedIncludes: ['킬로미터 0.001', '인치 39.370079'],
      },
    })

    await page.goto('/unit-converter')

    await pickCategory(page, '길이')
    await pickUnit(page, '미터 m')
    await page.getByTestId('unit-converter-input').fill('1')

    await expect(page.getByTestId('unit-result-kilometer')).toContainText('0.001')
    await expect(page.getByTestId('unit-result-inch')).toContainText('39.370079')
  })

  test('무게 카테고리에서 한국 생활 단위 근/돈을 포함해 결과가 갱신된다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        category: '무게',
        input: '1',
        fromUnit: '킬로그램 kg',
      },
      checks: {
        expectedIncludes: ['근 1.666667', '돈 266.666667', '파운드 2.204623'],
      },
    })

    await page.goto('/unit-converter')

    await pickCategory(page, '무게')
    await pickUnit(page, '킬로그램 kg')
    await page.getByTestId('unit-converter-input').fill('1')

    await expect(page.getByTestId('unit-result-geun')).toContainText('1.666667')
    await expect(page.getByTestId('unit-result-don')).toContainText('266.666667')
    await expect(page.getByTestId('unit-result-pound')).toContainText('2.204623')
  })

  test('면적 카테고리에서 평 기준 결과가 갱신된다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        category: '면적',
        input: '10',
        fromUnit: '평 평',
      },
      checks: {
        expectedIncludes: ['제곱미터 33.05785', '에이커 0.008168'],
      },
    })

    await page.goto('/unit-converter')

    await pickCategory(page, '면적')
    await pickUnit(page, '평 평')
    await page.getByTestId('unit-converter-input').fill('10')

    await expect(page.getByTestId('unit-result-square-meter')).toContainText('33.05785')
    await expect(page.getByTestId('unit-result-acre')).toContainText('0.008168')
  })

  test('온도 카테고리에서 섭씨 값을 화씨와 켈빈으로 변환한다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        category: '온도',
        input: '100',
        fromUnit: '섭씨 °C',
      },
      checks: {
        expectedIncludes: ['화씨 212', '켈빈 373.15'],
      },
    })

    await page.goto('/unit-converter')

    await pickCategory(page, '온도')
    await pickUnit(page, '섭씨 °C')
    await page.getByTestId('unit-converter-input').fill('100')

    await expect(page.getByTestId('unit-result-fahrenheit')).toContainText('212')
    await expect(page.getByTestId('unit-result-kelvin')).toContainText('373.15')
  })

  test('데이터 카테고리에서 decimal/binary 단위가 모두 갱신된다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        category: '데이터',
        input: '1024',
        fromUnit: '바이트 B',
      },
      checks: {
        expectedIncludes: [
          '킬로바이트 1.024',
          '키비바이트 1',
          '메가바이트 0.001024',
          '메비바이트 0.0009765625',
        ],
      },
    })

    await page.goto('/unit-converter')

    await pickCategory(page, '데이터')
    await pickUnit(page, '바이트 B')
    await page.getByTestId('unit-converter-input').fill('1024')

    await expect(page.getByTestId('unit-result-kilobyte')).toContainText('1.024')
    await expect(page.getByTestId('unit-result-kibibyte')).toContainText('1')
    await expect(page.getByTestId('unit-result-megabyte')).toContainText('0.001024')
    await expect(page.getByTestId('unit-result-mebibyte')).toContainText('0.0009765625')
    await expect(page.getByTestId('unit-result-gigabyte')).toContainText('0.000001024')
    await expect(page.getByTestId('unit-result-gibibyte')).toContainText('0.000000953674')
    await expect(page.getByTestId('unit-result-terabyte')).toContainText('0.000000001024')
    await expect(page.getByTestId('unit-result-tebibyte')).toContainText('0.000000000931')
  })

  test('부피 카테고리에서 리터 기준 결과가 갱신된다', async ({ page }, testInfo) => {
    setQaSummaryMetadata(testInfo, {
      parameters: {
        category: '부피',
        input: '1',
        fromUnit: '리터 L',
      },
      checks: {
        expectedIncludes: ['밀리리터 1,000', '갤런(US) 0.264172', '파인트(US) 2.113376'],
      },
    })

    await page.goto('/unit-converter')

    await pickCategory(page, '부피')
    await pickUnit(page, '리터 L')
    await page.getByTestId('unit-converter-input').fill('1')

    await expect(page.getByTestId('unit-result-milliliter')).toContainText('1,000')
    await expect(page.getByTestId('unit-result-gallon-us')).toContainText('0.264172')
    await expect(page.getByTestId('unit-result-pint-us')).toContainText('2.113376')
  })
})
