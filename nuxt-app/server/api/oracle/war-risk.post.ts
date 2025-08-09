import { db, stats, eventLogs } from '~/server/utils/db'
import { eq } from 'drizzle-orm'
import { broadcastWarRisk } from './war-risk/stream'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ corridor: string; ap_rate: number; ts: number }>(event)
    const { corridor, ap_rate, ts } = body || {}
    if (typeof corridor !== 'string' || typeof ap_rate !== 'number' || typeof ts !== 'number') {
        throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
    }
    await db.transaction(async (tx) => {
        const key = 'pricing.market_adjustment'
        const row = await tx.select().from(stats).where(eq(stats.key, key)).get()
        if (row) {
            await tx.update(stats).set({ value: String(ap_rate) }).where(eq(stats.key, key))
        } else {
            await tx.insert(stats).values({ key, value: String(ap_rate) })
        }
        await tx.insert(eventLogs).values({
            source: 'ORACLE',
            event_type: 'ORACLE',
            message: JSON.stringify({ type: 'WAR_RISK', corridor, ap_rate, ts })
        })
    })
    broadcastWarRisk({ corridor, ap_rate, ts })
    return { market_adjustment: ap_rate }
})