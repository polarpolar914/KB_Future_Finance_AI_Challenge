import { db, eventLogs } from '~/server/utils/db'
import { authGuard } from '../../utils/auth'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['buyer', 'seller', 'admin'])
  const body = await readBody<{ status: string; time?: string }>(event)
  await db.insert(eventLogs).values({
    source: 'APP',
    event_type: 'DEAL_STATUS',
    message: `${body.status} ${body.time || ''}`.trim(),
  })
  return { ok: true }
})

