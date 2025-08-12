import { readBody, createError } from 'h3'
import { findOrCreateUser } from '../../../utils/auth'
import { db, users } from '../../../utils/db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password, name } = body
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password required' })
  }
  const existing = db.select().from(users).where(eq(users.email, email)).get()
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: 'User exists' })
  }
  await findOrCreateUser(email, name, password)
  return { ok: true }
})
