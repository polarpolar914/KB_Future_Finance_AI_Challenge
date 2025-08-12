import { db, stats, eventLogs } from '~/server/utils/db'
import { authGuard } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['admin'])
  const keys = ['escrow_balance', 'vault_balance', 'pool_balance', 'seller_balance']
  await db.transaction(async (tx) => {
    for (const key of keys) {
      await tx.update(stats).set({ value: '0' }).where(eq(stats.key, key))
    }
    await tx.insert(eventLogs).values({ source: 'APP', event_type: 'FLOW', message: 'reset -> all 0' })
  })
  return { ok: true }
})
