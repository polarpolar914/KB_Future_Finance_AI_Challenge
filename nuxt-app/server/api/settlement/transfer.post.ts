import { db, stats, eventLogs } from '~/server/utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ from: string; to: string; amount: number }>(event)
  const { from, to, amount } = body
  if (!from || !to || !amount) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }
  const fromRow = await db.select().from(stats).where(eq(stats.key, `${from}_balance`)).get()
  const toRow = await db.select().from(stats).where(eq(stats.key, `${to}_balance`)).get()
  if (!fromRow || !toRow) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown account' })
  }
  const fromBal = Number(fromRow.value) - amount
  const toBal = Number(toRow.value) + amount
  await db.transaction(async (tx) => {
    await tx.update(stats).set({ value: String(fromBal) }).where(eq(stats.key, `${from}_balance`))
    await tx.update(stats).set({ value: String(toBal) }).where(eq(stats.key, `${to}_balance`))
    await tx.insert(eventLogs).values({ source: 'APP', event_type: 'FLOW', message: `${from} -> ${to} ${amount}` })
  })
  return { from: fromBal, to: toBal }
})
