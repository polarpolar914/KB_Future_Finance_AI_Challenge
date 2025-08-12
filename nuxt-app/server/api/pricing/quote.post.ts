import { readBody } from 'h3'
import { authGuard } from '../../utils/auth'
import { db, pricing, riskScores } from '../../utils/db'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['buyer', 'insurer'])
  const body = await readBody(event)
  const { deal_id, base_rate, market_adjustment = 0, amount } = body
  const rs = db
    .select()
    .from(riskScores)
    .where(eq(riskScores.deal_id, deal_id))
    .orderBy(desc(riskScores.id))
    .get()
  const risk = rs ? rs.ml_score / 100 : 0
  const premium_rate = base_rate + risk + market_adjustment
  const premium_amount = premium_rate * (amount || 0)
  db.insert(pricing)
    .values({
      deal_id,
      base_rate,
      risk_score: rs ? rs.ml_score : null,
      market_adjustment,
      premium_rate,
      premium_amount,
    })
    .run()
  return { premium_rate, premium_amount }
})
