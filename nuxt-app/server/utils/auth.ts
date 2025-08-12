import { getRequestHeader, createError } from 'h3'
import jwt from 'jsonwebtoken'
import { verifyMessage } from 'ethers'
import { db, users, roles, userRoles } from './db'
import { eq } from 'drizzle-orm'

const otpStore = new Map<string, string>()
const nonceStore = new Map<string, string>()

export function generateOtp(email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  otpStore.set(email, code)
  setTimeout(() => otpStore.delete(email), 5 * 60 * 1000)
  return code
}

export function verifyOtp(email: string, code: string) {
  const stored = otpStore.get(email)
  return stored === code
}

export function generateNonce(address: string) {
  const nonce = Math.random().toString(36).slice(2, 10)
  nonceStore.set(address.toLowerCase(), nonce)
  setTimeout(() => nonceStore.delete(address.toLowerCase()), 5 * 60 * 1000)
  return nonce
}

export function verifySiwe(address: string, signature: string) {
  const nonce = nonceStore.get(address.toLowerCase())
  if (!nonce) return false
  const message = `Sign in with wallet: ${nonce}`
  try {
    const recovered = verifyMessage(message, signature)
    nonceStore.delete(address.toLowerCase())
    return recovered.toLowerCase() === address.toLowerCase()
  } catch {
    return false
  }
}

function signAccessToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' })
}

function signRefreshToken(payload: any) {
  return jwt.sign(payload, process.env.REFRESH_SECRET || 'refresh', { expiresIn: '14d' })
}

export function issueTokens(user: any, rolesList: string[]) {
  const access = signAccessToken({ id: user.id, roles: rolesList })
  const refresh = signRefreshToken({ id: user.id })
  return { access, refresh }
}

export async function authGuard(event: any, requiredRoles: string[] = []) {
  const auth = getRequestHeader(event, 'authorization')
  if (!auth) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const token = auth.split(' ')[1]
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    event.context.user = payload
    if (requiredRoles.length && !requiredRoles.some(r => payload.roles?.includes(r))) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }
}

export async function findOrCreateUser(email: string, name?: string, password?: string) {
  let user = db.select().from(users).where(eq(users.email, email)).get()
  if (!user) {
    const res = db
      .insert(users)
      .values({ email, name, password, created_at: new Date().toISOString() })
      .run()
    user = { id: res.lastInsertRowid as number, email, name, password }
    let buyerRole = db.select().from(roles).where(eq(roles.code, 'buyer')).get()
    if (!buyerRole) {
      const roleRes = db.insert(roles).values({ code: 'buyer' }).run()
      buyerRole = { id: roleRes.lastInsertRowid as number, code: 'buyer' }
    }
    db.insert(userRoles).values({ user_id: user.id, role_id: buyerRole.id }).run()
  }
  const roleRows = db
    .select({ code: roles.code })
    .from(userRoles)
    .leftJoin(roles, eq(userRoles.role_id, roles.id))
    .where(eq(userRoles.user_id, user.id))
    .all()
  const roleCodes = roleRows.map((r) => r.code)
  return { user, roles: roleCodes }
}

export function authenticateUser(email: string, password: string) {
  const user = db.select().from(users).where(eq(users.email, email)).get()
  if (!user || user.password !== password) return null
  const roleRows = db
    .select({ code: roles.code })
    .from(userRoles)
    .leftJoin(roles, eq(userRoles.role_id, roles.id))
    .where(eq(userRoles.user_id, user.id))
    .all()
  const roleCodes = roleRows.map((r) => r.code)
  return { user, roles: roleCodes }
}

export async function findOrCreateUserByWallet(wallet: string) {
  let user = db.select().from(users).where(eq(users.wallet, wallet)).get()
  if (!user) {
    const res = db
      .insert(users)
      .values({ wallet, created_at: new Date().toISOString() })
      .run()
    user = { id: res.lastInsertRowid as number, wallet }
    let buyerRole = db.select().from(roles).where(eq(roles.code, 'buyer')).get()
    if (!buyerRole) {
      const roleRes = db.insert(roles).values({ code: 'buyer' }).run()
      buyerRole = { id: roleRes.lastInsertRowid as number, code: 'buyer' }
    }
    db.insert(userRoles).values({ user_id: user.id, role_id: buyerRole.id }).run()
  }
  const roleRows = db
    .select({ code: roles.code })
    .from(userRoles)
    .leftJoin(roles, eq(userRoles.role_id, roles.id))
    .where(eq(userRoles.user_id, user.id))
    .all()
  const roleCodes = roleRows.map((r) => r.code)
  return { user, roles: roleCodes }
}

export function getUserWithRoles(id: number) {
  const user = db.select().from(users).where(eq(users.id, id)).get()
  if (!user) return null
  const roleRows = db
    .select({ code: roles.code })
    .from(userRoles)
    .leftJoin(roles, eq(userRoles.role_id, roles.id))
    .where(eq(userRoles.user_id, id))
    .all()
  const roleCodes = roleRows.map((r) => r.code)
  return { user, roles: roleCodes }
}
