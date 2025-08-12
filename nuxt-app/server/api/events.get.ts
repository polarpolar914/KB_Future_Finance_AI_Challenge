import { db, eventLogs } from '~/server/utils/db'
import { desc } from 'drizzle-orm'
import { authGuard } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['buyer', 'seller', 'guarantor', 'insurer', 'admin'])
  const rows = await db.select().from(eventLogs).orderBy(desc(eventLogs.id))
  return rows
})
