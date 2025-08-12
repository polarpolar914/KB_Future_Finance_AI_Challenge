import { db, documents, deals as dealsTable } from '~/server/utils/db'
import { authGuard } from '~/server/utils/auth'
import { eq, or } from 'drizzle-orm'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['buyer', 'seller', 'admin'])
  const userId = event.context.user.id
  const query = getQuery(event)
  const dealId = query.dealId ? Number(query.dealId) : undefined

  const rows = await db.select().from(documents)
  let filtered = dealId ? rows.filter((r) => r.deal_id === dealId) : rows

  if (!event.context.user.roles.includes('admin')) {
    const dealRows = await db
      .select({ id: dealsTable.id })
      .from(dealsTable)
      .where(or(eq(dealsTable.buyer_user_id, userId), eq(dealsTable.seller_user_id, userId)))
      .all()
    const allowed = new Set(dealRows.map((d) => d.id))
    filtered = filtered.filter((r) => allowed.has(r.deal_id!))
  }

  return filtered.map((r) => ({ ...r, url: r.path }))
})
