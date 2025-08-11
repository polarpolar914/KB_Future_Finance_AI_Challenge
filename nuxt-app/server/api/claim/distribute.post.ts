import { db, eventLogs, stats, deals } from '~/server/utils/db'
import { eq } from 'drizzle-orm'
import { issueClaimNFT } from './issueNFT.post'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ step: number; dealId?: number; amount?: number }>(event)
  const step = body.step ?? 0
  const dealId = body.dealId ?? 1

  // Fetch balances
  const [escRow, sellerRow, guarRow, poolRow, claimRow] = await Promise.all([
    db.select().from(stats).where(eq(stats.key, 'escrow_balance')).get(),
    db.select().from(stats).where(eq(stats.key, 'seller_balance')).get(),
    db.select().from(stats).where(eq(stats.key, 'guarantee_balance')).get(),
    db.select().from(stats).where(eq(stats.key, 'pool_balance')).get(),
    db.select().from(stats).where(eq(stats.key, 'claims')).get(),
  ])

  let escrow = Number(escRow?.value || 0)
  let seller = Number(sellerRow?.value || 0)
  let guarantee = Number(guarRow?.value || 0)
  let pool = Number(poolRow?.value || 0)

  // Remaining claim amount either from request or stored in stats
  let remaining = Number(body.amount ?? 0)
  if (!remaining) remaining = Number(claimRow?.value || 0)

  let payout = 0
  let source = ''
  const now = new Date().toISOString()

  await db.transaction(async (tx) => {
    if (step === 0) {
      payout = remaining ? Math.min(escrow, remaining) : escrow
      escrow -= payout
      seller += payout
      remaining = Math.max(remaining - payout, 0)
      source = 'Escrow'
      await tx.update(stats).set({ value: String(escrow) }).where(eq(stats.key, 'escrow_balance'))
      await tx.update(stats).set({ value: String(seller) }).where(eq(stats.key, 'seller_balance'))
    } else if (step === 1) {
      payout = remaining ? Math.min(guarantee, remaining) : guarantee
      guarantee -= payout
      seller += payout
      remaining = Math.max(remaining - payout, 0)
      source = 'Guarantee'
      await tx.update(stats).set({ value: String(guarantee) }).where(eq(stats.key, 'guarantee_balance'))
      await tx.update(stats).set({ value: String(seller) }).where(eq(stats.key, 'seller_balance'))
    } else if (step === 2) {
      payout = remaining ? Math.min(pool, remaining) : pool
      pool -= payout
      seller += payout
      remaining = Math.max(remaining - payout, 0)
      source = 'Pool'
      await tx.update(stats).set({ value: String(pool) }).where(eq(stats.key, 'pool_balance'))
      await tx.update(stats).set({ value: String(seller) }).where(eq(stats.key, 'seller_balance'))
      await tx.update(deals).set({ status: 'CLAIM_PAID', updated_at: now }).where(eq(deals.id, dealId))
    } else {
      throw createError({ statusCode: 400, statusMessage: 'Invalid step' })
    }

    const existing = await tx.select().from(stats).where(eq(stats.key, 'claims')).get()
    if (existing) {
      await tx.update(stats).set({ value: String(remaining) }).where(eq(stats.key, 'claims'))
    } else {
      await tx.insert(stats).values({ key: 'claims', value: String(remaining) })
    }

    await tx.insert(eventLogs).values({
      deal_id: dealId,
      source,
      event_type: 'FLOW',
      message: `${source} -> Seller ${payout} USD`,
    })
  })

  if (step === 2) {
    await issueClaimNFT(dealId)
  }

  return {
    success: true,
    payout,
    remaining,
    balances: { escrow, guarantee, pool, seller },
  }
})
