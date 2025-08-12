import { db, documents, deals as dealsTable, dealMilestones, eventLogs } from '~/server/utils/db'
import { authGuard } from '~/server/utils/auth'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import fs from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['buyer', 'seller', 'admin'])
  const userId = event.context.user.id
  const form = await readMultipartFormData(event)
  const file = form?.find((f) => f.name === 'file')
  const dealId = Number(form?.find((f) => f.name === 'dealId')?.data?.toString())
  const milestoneId = Number(form?.find((f) => f.name === 'milestoneId')?.data?.toString())
  const docType = form?.find((f) => f.name === 'docType')?.data?.toString()

  if (!file || !file.filename || !file.data || !dealId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const [deal] = await db.select().from(dealsTable).where(eq(dealsTable.id, dealId))
  if (
    !deal ||
    (!event.context.user.roles.includes('admin') &&
      deal.buyer_user_id !== userId &&
      deal.seller_user_id !== userId)
  ) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  if (milestoneId) {
    const [milestone] = await db
      .select()
      .from(dealMilestones)
      .where(eq(dealMilestones.id, milestoneId))
    if (!milestone || milestone.deal_id !== dealId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid milestone' })
    }
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
  const filePath = join(uploadDir, file.filename)
  fs.writeFileSync(filePath, file.data as Buffer)
  const url = `/uploads/${file.filename}`

  const res = await db
    .insert(documents)
    .values({
      name: file.filename,
      path: url,
      status: 'UPLOADED',
      deal_id: dealId,
      milestone_id: milestoneId,
      doc_type: docType,
      uploaded_by: userId,
    })
    .run()

  await db.insert(eventLogs).values({
    source: 'APP',
    event_type: 'DOC',
    message: `Uploaded ${file.filename}`,
    deal_id: dealId,
  })

  const docId = res.lastInsertRowid as number
  setTimeout(() => {
    db.update(documents).set({ status: 'VERIFIED' }).where(eq(documents.id, docId)).run()
  }, 1000)

  return { name: file.filename, url }
})
