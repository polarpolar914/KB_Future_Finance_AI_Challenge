import { readBody, createError } from 'h3'
import jwt from 'jsonwebtoken'
import { getUserWithRoles, issueTokens } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { refresh } = body
  try {
    const payload: any = jwt.verify(refresh, process.env.REFRESH_SECRET || 'refresh')
    const data = getUserWithRoles(payload.id)
    if (!data) {
      throw new Error('user not found')
    }
    const tokens = issueTokens(data.user, data.roles)
    return tokens
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid refresh token' })
  }
})
