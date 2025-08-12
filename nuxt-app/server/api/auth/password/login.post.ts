import { readBody, createError, setCookie } from 'h3'
import { authenticateUser, issueTokens } from '../../../utils/auth'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const schema = z.object({ email: z.string().email(), password: z.string() })
  const { email, password } = schema.parse(body)
  const res = authenticateUser(email, password)
  if (!res) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }
  const tokens = issueTokens(res.user, res.roles)
  setCookie(event, 'access_token', tokens.access, {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
  })
  setCookie(event, 'refresh_token', tokens.refresh, {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
  })
  return { success: true }
})
