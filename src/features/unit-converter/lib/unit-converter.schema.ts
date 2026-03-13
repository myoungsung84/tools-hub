import { z } from 'zod'

import { UNIT_CATEGORY_IDS } from './unit-converter.constants'

export const unitCategoryIdSchema = z.enum(UNIT_CATEGORY_IDS)

export const unitValueSchema = z.coerce
  .number({ message: '숫자를 입력해 주세요.' })
  .finite('유효한 숫자를 입력해 주세요.')

export const unitConverterRequestSchema = z.object({
  categoryId: unitCategoryIdSchema,
  fromUnitId: z.string().trim().min(1),
  value: z.number().finite(),
})

export type UnitConverterRequest = z.infer<typeof unitConverterRequestSchema>
