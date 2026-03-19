import type { Page } from '@playwright/test'

export async function freezeBrowserTime(page: Page, isoString: string) {
  await page.addInitScript(
    ({ iso }) => {
      const fixedTime = new Date(iso).valueOf()
      const OriginalDate = Date

      class MockDate extends OriginalDate {
        constructor(...args: unknown[]) {
          if (args.length === 0) {
            super(fixedTime)
            return
          }

          super(...(args as ConstructorParameters<typeof Date>))
        }

        static now() {
          return fixedTime
        }

        static parse(value: string) {
          return OriginalDate.parse(value)
        }

        static UTC(...args: Parameters<typeof Date.UTC>) {
          return OriginalDate.UTC(...args)
        }
      }

      Object.defineProperty(window, 'Date', {
        configurable: true,
        writable: true,
        value: MockDate,
      })
    },
    { iso: isoString }
  )
}
