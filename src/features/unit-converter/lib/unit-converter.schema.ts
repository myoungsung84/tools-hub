import { z } from 'zod'

import { UNIT_CATEGORY_IDS } from './unit-converter.constants'

export const unitCategoryIdSchema = z.enum(UNIT_CATEGORY_IDS)

export const unitValueSchema = z
  .string()
  .min(1, '숫자를 입력해 주세요.')
  .transform((val, ctx) => {
    const num = Number(val)
    if (Number.isNaN(num)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: '숫자를 입력해 주세요.' })
      return z.NEVER
    }
    if (!Number.isFinite(num)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: '유효한 숫자를 입력해 주세요.' })
      return z.NEVER
    }
    return num
  })

export const unitConverterRequestSchema = z.object({
  categoryId: unitCategoryIdSchema,
  fromUnitId: z.string().trim().min(1),
  value: z.number().finite(),
})

export type UnitConverterRequest = z.infer<typeof unitConverterRequestSchema>
