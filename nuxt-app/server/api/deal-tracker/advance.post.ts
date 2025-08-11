import { db, eventLogs } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ status: string; time?: string }>(event)
  await db.insert(eventLogs).values({
    source: 'APP',
    event_type: 'DEAL_STATUS',
    message: `${body.status} ${body.time || ''}`.trim(),
  })
  return { ok: true }
})

