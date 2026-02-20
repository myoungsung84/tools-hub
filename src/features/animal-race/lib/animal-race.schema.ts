import { z } from 'zod'

import {
  ANIMAL_KEYS,
  DEFAULT_DURATION_MS,
  DEFAULT_PARTICIPANT_COUNT,
  MAX_PARTICIPANT_COUNT,
  MIN_PARTICIPANT_COUNT,
} from './animal-race.presets'

export const animalKeySchema = z.enum(ANIMAL_KEYS)

export const participantSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  animalKey: animalKeySchema,
  power: z.number().optional(),
  laps: z.number().optional(),
})

export const participantListSchema = z
  .array(participantSchema)
  .min(MIN_PARTICIPANT_COUNT)
  .max(MAX_PARTICIPANT_COUNT)
  .superRefine((participants, ctx) => {
    const ids = new Set<string>()

    participants.forEach((participant, index) => {
      if (ids.has(participant.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, 'id'],
          message: 'participant id는 고유해야 합니다.',
        })
        return
      }

      ids.add(participant.id)
    })
  })

export const raceConfigSchema = z.object({
  participantCount: z
    .number()
    .int()
    .min(MIN_PARTICIPANT_COUNT)
    .max(MAX_PARTICIPANT_COUNT)
    .default(DEFAULT_PARTICIPANT_COUNT),
  durationMs: z.number().int().min(3000).max(15000).default(DEFAULT_DURATION_MS),
  seed: z.string().min(1).default('animal-race-seed'),
  allowDuplicates: z.boolean().default(false),
  sabotageEnabled: z.boolean().default(false),
})

export const raceResultSchema = z.object({
  finishOrder: z.array(z.string()),
  timeline: z.array(
    z.object({
      participantId: z.string(),
      progress: z.array(z.number().min(0).max(1)),
    })
  ),
})

export type ParticipantInput = z.infer<typeof participantSchema>
export type RaceConfigInput = z.infer<typeof raceConfigSchema>
export type RaceResultInput = z.infer<typeof raceResultSchema>
