import dayjs from 'dayjs'

import { handleApi, success } from '@/lib/server'

export async function handler() {
  return success({
    status: 'healthy' as const,
    ts: dayjs().toISOString(),
  })
}

export const GET = handleApi(handler, {
  tag: '[api.health]',
  internalMessage: 'Health check failed',
})
