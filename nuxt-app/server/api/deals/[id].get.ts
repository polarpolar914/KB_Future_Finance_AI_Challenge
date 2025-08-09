import { db, deals, dealMilestones, pricing, riskScores } from '~/server/utils/db'
import { eq, asc } from 'drizzle-orm'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid deal id' })
  }

  const [deal] = await db.select().from(deals).where(eq(deals.id, id))
  if (!deal) {
    throw createError({ statusCode: 404, statusMessage: 'Deal not found' })
  }

  const milestones = await db
    .select()
    .from(dealMilestones)
    .where(eq(dealMilestones.deal_id, id))
    .orderBy(asc(dealMilestones.ord))

  const [pricingRow] = await db
    .select()
    .from(pricing)
    .where(eq(pricing.deal_id, id))

  const [riskRow] = await db
    .select()
    .from(riskScores)
    .where(eq(riskScores.deal_id, id))

  const riskSubScores = riskRow
    ? {
        trader_history: riskRow.trader_history ?? 0,
        route_risk: riskRow.route_risk ?? 0,
        commodity_volatility: riskRow.commodity_volatility ?? 0,
        geopolitical_index: riskRow.geopolitical_index ?? 0,
        weather_forecast: riskRow.weather_forecast ?? 0,
        network_health: riskRow.network_health ?? 0,
      }
    : undefined

  return {
    deal,
    milestones,
    premium: pricingRow,
    riskScore: riskRow?.ml_score ?? null,
    riskSubScores,
  }
})
