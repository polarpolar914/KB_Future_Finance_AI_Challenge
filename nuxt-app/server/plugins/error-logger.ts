import { db, eventLogs } from '~/server/utils/db'

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('error', async (err) => {
    await db.insert(eventLogs).values({
      source: 'APP',
      event_type: 'ERROR',
      message: err.message,
      created_at: new Date().toISOString(),
    })
  })
})
