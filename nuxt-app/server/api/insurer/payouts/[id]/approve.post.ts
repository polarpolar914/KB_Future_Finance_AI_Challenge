import { db, eventLogs } from '~/server/utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }
  const log = await db.select().from(eventLogs).where(eq(eventLogs.id, id)).get()
  if (!log) {
    throw createError({ statusCode: 404, statusMessage: 'Payout not found' })
  }
  await db.insert(eventLogs).values({ source: 'APP', event_type: 'PAYOUT_APPROVED', message: `Payout ${id} approved` })
  return { success: true }
})
