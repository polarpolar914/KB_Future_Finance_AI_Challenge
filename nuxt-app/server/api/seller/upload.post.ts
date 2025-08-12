import { db, documents, eventLogs, deals as dealsTable, dealMilestones } from '~/server/utils/db'
import fs from 'node:fs'
import { join } from 'node:path'
import { authGuard } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['seller'])
  const userId = event.context.user.id

  const form = await readMultipartFormData(event)
  const file = form?.find((f) => f.name === 'file')
  const dealId = Number(form?.find((f) => f.name === 'dealId')?.data?.toString())
  const milestoneId = Number(
    form?.find((f) => f.name === 'milestoneId')?.data?.toString()
  )
  const docType = form?.find((f) => f.name === 'docType')?.data?.toString()

  if (!file || !file.filename || !file.data || !dealId || !milestoneId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const [deal] = await db.select().from(dealsTable).where(eq(dealsTable.id, dealId))
  if (!deal || deal.seller_user_id !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  const [milestone] = await db
    .select()
    .from(dealMilestones)
    .where(eq(dealMilestones.id, milestoneId))
  if (!milestone || milestone.deal_id !== dealId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid milestone' })
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
  const filePath = join(uploadDir, file.filename)
  fs.writeFileSync(filePath, file.data as Buffer)
  const url = `/uploads/${file.filename}`

  await db.insert(documents).values({
    name: file.filename,
    path: url,
    status: 'UPLOADED',
    deal_id: dealId,
    milestone_id: milestoneId,
    doc_type: docType,
    uploaded_by: userId,
  })
  await db.insert(eventLogs).values({
    source: 'APP',
    event_type: 'DOC',
    message: `Uploaded ${file.filename}`,
    deal_id: dealId,
  })
  return { name: file.filename, url }
})
