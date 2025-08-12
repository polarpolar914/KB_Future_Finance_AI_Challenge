import { db, eventLogs } from '~/server/utils/db'
import { desc } from 'drizzle-orm'
import { authGuard } from '~/server/utils/auth'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['admin'])
  const { dealId, type } = getQuery(event)
  const rows = await db.select().from(eventLogs).orderBy(desc(eventLogs.id))
  let filtered = rows
  if (dealId) filtered = filtered.filter(r => r.deal_id === Number(dealId))
  if (type) filtered = filtered.filter(r => r.event_type === String(type))
  return filtered.map(r => ({
    ...r,
    event_type: r.event_type === 'WAR_RISK' ? 'ORACLE' : r.event_type,
  }))
})
