import { db, stats } from '~/server/utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ coverage: number }>(event)
  const coverage = Number(body.coverage)
  if (isNaN(coverage)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid coverage' })
  }
  const row = await db.select().from(stats).where(eq(stats.key, 'coverage_pct')).get()
  if (row) {
    await db.update(stats).set({ value: String(coverage) }).where(eq(stats.key, 'coverage_pct'))
  } else {
    await db.insert(stats).values({ key: 'coverage_pct', value: String(coverage) })
  }
  return { coverage }
})
