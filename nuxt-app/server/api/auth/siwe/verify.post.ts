import { readBody, createError, setCookie } from 'h3'
import { verifySiwe, findOrCreateUserByWallet, issueTokens } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const address = body.address as string
  const signature = body.signature as string
  if (!address || !signature) {
    throw createError({ statusCode: 400, statusMessage: 'address and signature required' })
  }
  if (!verifySiwe(address, signature)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }
  const { user, roles } = await findOrCreateUserByWallet(address)
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
    maxAge: 14 * 24 * 3600,
    path: '/',
  })
  return { success: true }
})

