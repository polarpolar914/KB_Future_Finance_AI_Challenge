import { db, pricing, riskScores, deals, stats } from '~/server/utils/db'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ dealId: number }>(event)
    const { dealId } = body
    if (!dealId) {
        throw createError({ statusCode: 400, statusMessage: 'dealId required' })
    }

    const risk = await db
        .select()
        .from(riskScores)
        .where(eq(riskScores.deal_id, dealId))
        .orderBy(desc(riskScores.computed_at))
        .get()
    if (!risk) {
        throw createError({ statusCode: 404, statusMessage: 'Risk score not found' })
    }

    const deal = await db
        .select({ amount: deals.amount, currency: deals.currency })
        .from(deals)
        .where(eq(deals.id, dealId))
        .get()
    if (!deal) {
        throw createError({ statusCode: 404, statusMessage: 'Deal not found' })
    }

    const baseRate = 0.02
    const maRow = await db
        .select()
        .from(stats)
        .where(eq(stats.key, 'pricing.market_adjustment'))
        .get()
    const marketAdjustment = Number(maRow?.value || 1)
    const premiumRate = baseRate * (1 + risk.ml_score) * marketAdjustment
    const premiumAmount = Number(deal.amount) * premiumRate

    await db.insert(pricing).values({
        deal_id: dealId,
        base_rate: baseRate,
        risk_score: risk.ml_score,
        market_adjustment: marketAdjustment,
        premium_rate: premiumRate,
        premium_amount: premiumAmount,
    })

    return {
        premium_rate: premiumRate,
        premium_amount: premiumAmount,
        breakdown: {
            base_rate: baseRate,
            risk_score: risk.ml_score,
            market_adjustment: marketAdjustment,
        },
        currency: deal.currency,
    }
})