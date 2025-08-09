import { db, payoutRequests } from '~/server/utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const rows = await db.select().from(payoutRequests).where(eq(payoutRequests.status, 'PENDING'))
  return rows
})
