import { db, stats, eventLogs } from '~/server/utils/db'
import { createError } from 'h3'
import { eq } from 'drizzle-orm'
import { broadcastGeo } from './geopolitical/stream'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ region: string; level: number; ts: number }>(event)
  const { region, level, ts } = body || {}
  if (typeof region !== 'string' || typeof level !== 'number' || typeof ts !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }
  await db.transaction(async (tx) => {
    const key = 'geopolitical_risk'
    const row = await tx.select().from(stats).where(eq(stats.key, key)).get()
    if (row) {
      await tx.update(stats).set({ value: String(level) }).where(eq(stats.key, key))
    } else {
      await tx.insert(stats).values({ key, value: String(level) })
    }
    await tx.insert(eventLogs).values({
      source: 'ORACLE',
      event_type: 'ORACLE',
      message: JSON.stringify({ type: 'GEOPOLITICAL', region, level, ts })
    })
  })
  broadcastGeo({ region, level, ts })
  return { geopolitical_risk: level }
})
