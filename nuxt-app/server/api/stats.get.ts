import { db, stats } from '~/server/utils/db'
import { inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const keysParam = getQuery(event).keys as string | undefined
  const keys = keysParam ? keysParam.split(',') : []
  const rows = keys.length
    ? await db.select().from(stats).where(inArray(stats.key, keys))
    : await db.select().from(stats)
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
})
