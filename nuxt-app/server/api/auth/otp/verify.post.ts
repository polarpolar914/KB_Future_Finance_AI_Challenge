import { readBody, createError, setCookie } from 'h3'
import { verifyOtp, findOrCreateUser, issueTokens } from '../../../utils/auth'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const schema = z.object({ email: z.string().email(), code: z.string(), name: z.string().optional() })
  const { email, code, name } = schema.parse(body)
  if (!verifyOtp(email, code)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid OTP' })
  }
  const { user, roles } = await findOrCreateUser(email, name)
  const tokens = issueTokens(user, roles)
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
