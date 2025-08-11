import { db, deals, eventLogs, payoutRequests } from '~/server/utils/db'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import { broadcastClaim } from './stream'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ dealId?: number; amount?: number; reason?: string }>(event)
  const dealId = body?.dealId
  if (typeof dealId !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid dealId' })
  }
  const amount = typeof body.amount === 'number' ? body.amount : 0
  const reason = body.reason || 'Claim issued'
  const now = new Date().toISOString()
  await db.transaction(async (tx) => {
    await tx
      .update(deals)
      .set({ status: 'CLAIM_ISSUED', updated_at: now })
      .where(eq(deals.id, dealId))
    await tx.insert(eventLogs).values({
      deal_id: dealId,
      source: 'APP',
      event_type: 'CLAIM',
      message: reason,
      created_at: now,
    })
    await tx.insert(payoutRequests).values({
      deal: String(dealId),
      amount,
      status: 'REQUESTED',
    })
  })
  broadcastClaim({ dealId, amount, reason, ts: Date.now() })
  return { success: true }
})
