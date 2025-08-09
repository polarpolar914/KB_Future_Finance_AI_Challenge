import { db, dealMilestones, deals, stats, eventLogs } from '~/server/utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const id = Number(event.context.params?.id)
    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
    }

    const milestone = await db
        .select()
        .from(dealMilestones)
        .where(eq(dealMilestones.id, id))
        .get()
    if (!milestone) {
        throw createError({ statusCode: 404, statusMessage: 'Milestone not found' })
    }

    const deal = await db
        .select()
        .from(deals)
        .where(eq(deals.id, milestone.deal_id))
        .get()
    const allMilestones = await db
        .select()
        .from(dealMilestones)
        .where(eq(dealMilestones.deal_id, milestone.deal_id))
    const amountPer = allMilestones.length
        ? Number(deal.amount) / allMilestones.length
        : 0

    const escrowRow = await db
        .select()
        .from(stats)
        .where(eq(stats.key, 'escrow_balance'))
        .get()
    const sellerRow = await db
        .select()
        .from(stats)
        .where(eq(stats.key, 'seller_balance'))
        .get()
    let escrowBal = Number(escrowRow?.value || 0)
    let sellerBal = Number(sellerRow?.value || 0)

    const now = new Date().toISOString()

    await db.transaction(async (tx) => {
        await tx
            .update(dealMilestones)
            .set({ status: 'CONFIRMED', confirmed_at: now })
            .where(eq(dealMilestones.id, id))
        await tx.insert(eventLogs).values({
            deal_id: milestone.deal_id,
            source: 'APP',
            event_type: 'MILESTONE',
            message: `Milestone ${milestone.description} confirmed`,
        })

        escrowBal -= amountPer
        sellerBal += amountPer
        await tx
            .update(stats)
            .set({ value: String(escrowBal) })
            .where(eq(stats.key, 'escrow_balance'))
        await tx
            .update(stats)
            .set({ value: String(sellerBal) })
            .where(eq(stats.key, 'seller_balance'))
        await tx.insert(eventLogs).values({
            deal_id: milestone.deal_id,
            source: 'APP',
            event_type: 'FLOW',
            message: `Escrow -> Seller ${amountPer} USD`,
        })
    })

    return {
        milestone: { ...milestone, status: 'CONFIRMED', confirmed_at: now },
        balances: { escrow: escrowBal, seller: sellerBal },
    }
})
