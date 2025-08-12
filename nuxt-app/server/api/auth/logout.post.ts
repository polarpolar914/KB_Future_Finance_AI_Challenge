import { setCookie } from 'h3'

export default defineEventHandler((event) => {
  setCookie(event, 'access_token', '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'strict', secure: true })
  setCookie(event, 'refresh_token', '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'strict', secure: true })
  return { ok: true }
})

