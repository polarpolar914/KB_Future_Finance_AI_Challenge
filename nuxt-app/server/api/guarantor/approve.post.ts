import { db, payoutRequests, stats, eventLogs } from '~/server/utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ id: number }>(event)
  const id = Number(body.id)
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }
  const req = await db.select().from(payoutRequests).where(eq(payoutRequests.id, id)).get()
  if (!req) {
    throw createError({ statusCode: 404, statusMessage: 'Request not found' })
  }
  await db.transaction(async (tx) => {
    await tx
      .update(payoutRequests)
      .set({ status: 'APPROVED' })
      .where(eq(payoutRequests.id, id))
    const balRow = await tx.select().from(stats).where(eq(stats.key, 'guarantee_balance')).get()
    const bal = Number(balRow?.value || 0) - Number(req.amount)
    await tx.update(stats).set({ value: String(bal) }).where(eq(stats.key, 'guarantee_balance'))
    await tx.insert(eventLogs).values({ source: 'APP', event_type: 'PAYOUT', message: `Guarantor approved ${req.deal}` })
  })
  return { success: true }
})
