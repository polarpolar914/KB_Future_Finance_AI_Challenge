import { readBody, createError } from 'h3'
import { z } from 'zod'
import { authGuard } from '../utils/auth'
import { db, deals, dealMilestones } from '../utils/db'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['buyer'])
  const body = await readBody(event)
  const schema = z.object({
    amount: z.number(),
    currency: z.string(),
    incoterms: z.string().optional(),
    deposit_pct: z.number().optional(),
    milestones: z.array(
      z.object({ ord: z.number(), description: z.string(), amount: z.number() })
    ),
  })
  const data = schema.parse(body)
  const total = data.milestones.reduce((s, m) => s + m.amount, 0)
  if (total !== data.amount) {
    throw createError({ statusCode: 400, statusMessage: 'Milestone total mismatch' })
  }
  const res = db
    .insert(deals)
    .values({
      amount: data.amount,
      currency: data.currency,
      incoterms: data.incoterms,
      deposit_pct: data.deposit_pct,
      buyer_user_id: event.context.user.id,
      status: 'created',
      created_at: new Date().toISOString(),
    })
    .run()
  const dealId = res.lastInsertRowid as number
  for (const m of data.milestones) {
    db.insert(dealMilestones)
      .values({ deal_id: dealId, ord: m.ord, description: m.description, amount: m.amount, status: 'pending' })
      .run()
  }
  return { id: dealId }
})
