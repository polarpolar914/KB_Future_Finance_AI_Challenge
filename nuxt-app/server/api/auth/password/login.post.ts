import { readBody, createError, setCookie } from 'h3'
import { authenticateUser, issueTokens } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password required' })
  }
  const res = authenticateUser(email, password)
  if (!res) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }
  const tokens = issueTokens(res.user, res.roles)
  setCookie(event, 'refresh', tokens.refresh, {
    httpOnly: true,
    maxAge: 14 * 24 * 3600,
    path: '/',
  })
  return { access: tokens.access }
})
