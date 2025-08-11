import { db, documents, eventLogs } from '~/server/utils/db'
import fs from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  const file = form?.find((f) => f.name === 'file')
  if (!file || !file.filename || !file.data) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
  const filePath = join(uploadDir, file.filename)
  fs.writeFileSync(filePath, file.data as Buffer)
  const url = `/uploads/${file.filename}`

  await db.insert(documents).values({ name: file.filename, path: url, status: 'UPLOADED' })
  await db.insert(eventLogs).values({ source: 'APP', event_type: 'DOC', message: `Uploaded ${file.filename}` })
  return { name: file.filename, url }
})
