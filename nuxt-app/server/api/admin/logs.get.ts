import { db, eventLogs } from '~/server/utils/db'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const rows = await db.select().from(eventLogs).orderBy(desc(eventLogs.id))
  return rows.map(r => ({
    ...r,
    event_type: r.event_type === 'WAR_RISK' ? 'ORACLE' : r.event_type,
  }))
})
