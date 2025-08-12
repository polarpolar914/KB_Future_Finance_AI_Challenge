import { db, deals, dealMilestones, pricing, riskScores } from '~/server/utils/db'
import { eq, asc } from 'drizzle-orm'
import { createError } from 'h3'
import { getEscrowStatus } from '~/server/utils/chain'
import { authGuard } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['buyer', 'seller', 'admin'])

  const id = Number(event.context.params?.id)
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid deal id' })
  }

  const [deal] = await db.select().from(deals).where(eq(deals.id, id))
  if (!deal) {
    throw createError({ statusCode: 404, statusMessage: 'Deal not found' })
  }

  const user = event.context.user
  const allowed =
    deal.buyer_user_id === user.id ||
    deal.seller_user_id === user.id ||
    user.roles?.includes('admin')
  if (!allowed) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
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

  const chainStatus = deal.contract_address
    ? await getEscrowStatus(deal.contract_address, milestones.length)
    : null

  return {
    deal,
    milestones,
    premium: pricingRow,
    riskScore: riskRow?.ml_score ?? null,
    riskSubScores,
    chainStatus,
  }
})
