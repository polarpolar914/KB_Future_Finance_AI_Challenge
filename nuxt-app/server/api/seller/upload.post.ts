import { db, documents, eventLogs } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find(f => f.name === 'file')
  if (!file || !file.filename) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }
  await db.insert(documents).values({ name: file.filename, status: 'UPLOADED' })
  await db.insert(eventLogs).values({ source: 'APP', event_type: 'DOC', message: `Uploaded ${file.filename}` })
  return { name: file.filename }
})
