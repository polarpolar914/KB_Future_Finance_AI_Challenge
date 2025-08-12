import { readBody, createError } from 'h3'
import { findOrCreateUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, name } = body
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email required' })
  }
  const { user, roles } = await findOrCreateUser(email, name)
  return { id: user.id, email: user.email, roles }
})
