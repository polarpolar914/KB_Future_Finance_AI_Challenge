import { db, stats, eventLogs } from '~/server/utils/db'
import { eq } from 'drizzle-orm'
import { authGuard } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['buyer'])
  const row = await db.select().from(stats).where(eq(stats.key, 'claims')).get()
  const count = Number(row?.value || 0) + 1
  await db.transaction(async tx => {
    await tx.update(stats).set({ value: String(count) }).where(eq(stats.key, 'claims'))
    await tx.insert(eventLogs).values({ source: 'APP', event_type: 'CLAIM', message: 'Buyer requested claim' })
  })
  return { claims: count }
})
