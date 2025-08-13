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
  const cookieOpts = {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
  setCookie(event, 'access_token', tokens.access, cookieOpts)
  setCookie(event, 'refresh_token', tokens.refresh, cookieOpts)
  // Return the tokens and role information so the frontend can persist them and
  // immediately know the authenticated user's permissions.
  return { access: tokens.access, refresh: tokens.refresh, roles: res.roles }
})
