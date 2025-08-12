import { readBody, createError } from 'h3'
import { authGuard } from '../../utils/auth'
import { db, claimNfts } from '../../utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['admin'])
  const body = await readBody(event)
  const { deal_id, token_id, metadata } = body
  const existing = db.select().from(claimNfts).where(eq(claimNfts.deal_id, deal_id)).get()
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: 'NFT already issued' })
  }
  db.insert(claimNfts).values({ deal_id, token_id, metadata }).run()
  return { ok: true }
})
