import { db, eventLogs } from '~/server/utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const rows = await db.select().from(eventLogs).where(eq(eventLogs.event_type, 'FLOW'))
  return rows
})
