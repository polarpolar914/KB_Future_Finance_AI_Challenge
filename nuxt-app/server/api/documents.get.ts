import { db, documents } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const rows = await db.select().from(documents)
  return rows
})
