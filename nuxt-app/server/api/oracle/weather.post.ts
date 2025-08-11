import { db, stats, eventLogs } from '~/server/utils/db'
import { createError } from 'h3'
import { eq } from 'drizzle-orm'
import { broadcastWeather } from './weather/stream'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ location: string; severity: number; ts: number }>(event)
  const { location, severity, ts } = body || {}
  if (typeof location !== 'string' || typeof severity !== 'number' || typeof ts !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }
  await db.transaction(async (tx) => {
    const key = 'weather_risk'
    const row = await tx.select().from(stats).where(eq(stats.key, key)).get()
    if (row) {
      await tx.update(stats).set({ value: String(severity) }).where(eq(stats.key, key))
    } else {
      await tx.insert(stats).values({ key, value: String(severity) })
    }
    await tx.insert(eventLogs).values({
      source: 'ORACLE',
      event_type: 'ORACLE',
      message: JSON.stringify({ type: 'WEATHER', location, severity, ts })
    })
  })
  broadcastWeather({ location, severity, ts })
  return { weather_risk: severity }
})
