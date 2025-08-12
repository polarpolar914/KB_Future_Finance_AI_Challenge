import { readBody, createError, getCookie, setCookie } from 'h3'
import jwt from 'jsonwebtoken'
import { getUserWithRoles, issueTokens } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const refresh = getCookie(event, 'refresh') || body.refresh
  try {
    const payload: any = jwt.verify(refresh, process.env.REFRESH_SECRET || 'refresh')
    const data = getUserWithRoles(payload.id)
    if (!data) {
      throw new Error('user not found')
    }
    const tokens = issueTokens(data.user, data.roles)
    setCookie(event, 'refresh', tokens.refresh, {
      httpOnly: true,
      maxAge: 14 * 24 * 3600,
      path: '/',
    })
    return { access: tokens.access }
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid refresh token' })
  }
})
