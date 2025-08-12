import { authGuard } from '~/server/utils/auth'
import { db, deals } from '~/server/utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['buyer'])
  const userId = event.context.user.id
  const rows = await db.select().from(deals).where(eq(deals.buyer_user_id, userId))
  return rows
})
