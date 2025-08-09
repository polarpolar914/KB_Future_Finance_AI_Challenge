import { db, deals } from '~/server/utils/db'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const rows = await db.select().from(deals).orderBy(desc(deals.id))
  return rows
})
