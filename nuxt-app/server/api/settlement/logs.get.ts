import { db, eventLogs } from '~/server/utils/db'
import { eq } from 'drizzle-orm'
import { authGuard } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['admin'])
  const rows = await db.select().from(eventLogs).where(eq(eventLogs.event_type, 'FLOW'))
  return rows
})
