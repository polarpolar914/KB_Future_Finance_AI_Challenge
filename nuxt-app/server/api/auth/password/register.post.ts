import { readBody, createError } from 'h3'
import { db, users, roles, userRoles } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
  })
  const { email, password, name } = schema.parse(body)
  const existing = db.select().from(users).where(eq(users.email, email)).get()
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: 'Email already registered' })
  }
  const res = db
    .insert(users)
    .values({ email, name, password, created_at: new Date().toISOString() })
    .run()
  const userId = res.lastInsertRowid as number
  let buyerRole = db.select().from(roles).where(eq(roles.code, 'buyer')).get()
  if (!buyerRole) {
    const roleRes = db.insert(roles).values({ code: 'buyer' }).run()
    buyerRole = { id: roleRes.lastInsertRowid as number, code: 'buyer' }
  }
  db.insert(userRoles).values({ user_id: userId, role_id: buyerRole.id }).run()
  return { success: true }
})
