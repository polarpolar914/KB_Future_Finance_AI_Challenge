import { eventLogs, db } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const id = 'claim-' + Math.random().toString(36).slice(2)
  await db.insert(eventLogs).values({ source: 'APP', event_type: 'NFT', message: `Issued ${id}` })
  return { id }
})
