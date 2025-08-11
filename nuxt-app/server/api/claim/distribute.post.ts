import { eventLogs, db } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ step: number }>(event)
  const step = body.step ?? 0
  await db.insert(eventLogs).values({ source: 'APP', event_type: 'DISTRIBUTE', message: `Claim step ${step}` })
  return { success: true }
})
