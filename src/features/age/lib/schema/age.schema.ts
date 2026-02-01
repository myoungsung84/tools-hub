import { z } from 'zod'

const dateYmd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/i, 'YYYY-MM-DD 형식이어야 합니다.')

export const zodiacBasisSchema = z.enum(['year', 'seollal', 'ipchun'])

/**
 * /age 입력 스키마
 * - birth: 필수(YYYY-MM-DD)
 * - asOf: 필수(YYYY-MM-DD) (UI에서 기본 today 넣어줌)
 * - zodiacBasis: 띠 기준 (기본 year)
 */
export const ageInputSchema = z.object({
  birth: dateYmd,
  asOf: dateYmd,
  zodiacBasis: zodiacBasisSchema.default('year'),
})

export type AgeInput = z.infer<typeof ageInputSchema>

export const ageResultSchema = z.object({
  birth: z.string(),
  asOf: z.string(),
  manAge: z.number().nullable(),
  koreanAge: z.number().nullable(),

  zodiac: z
    .object({
      label: z.string(),
      basis: zodiacBasisSchema,
      appliedYear: z.number(),
      cutoffDate: z.string().nullable(),
      note: z.string().nullable(),
    })
    .nullable(),

  westernZodiac: z.string().nullable(),

  ganji: z
    .object({
      label: z.string(), // 갑자년
      hanja: z.string(), // 甲子年
    })
    .nullable(),

  error: z.string().nullable(),
})

export type AgeResult = z.infer<typeof ageResultSchema>
export type ZodiacBasis = z.infer<typeof zodiacBasisSchema>
