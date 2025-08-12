import { readBody, createError } from 'h3'
import { verifyOtp, findOrCreateUser, issueTokens } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, code, name } = body
  if (!verifyOtp(email, code)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid OTP' })
  }
  const { user, roles } = await findOrCreateUser(email, name)
  const tokens = issueTokens(user, roles)
  return tokens
})
