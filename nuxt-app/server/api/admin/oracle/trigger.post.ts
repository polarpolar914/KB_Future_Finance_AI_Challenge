import { db, eventLogs } from '~/server/utils/db'
import { authGuard } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['admin'])
  const body = await readBody<{ note?: string }>(event)
  await db.insert(eventLogs).values({
    source: 'ORACLE',
    event_type: 'ORACLE',
    message: body?.note || 'Manual oracle trigger',
    created_at: new Date().toISOString(),
  })
  return { ok: true }
})
