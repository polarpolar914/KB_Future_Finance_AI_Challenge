import { setCookie } from 'h3'

export default defineEventHandler((event) => {
  setCookie(event, 'refresh', '', { httpOnly: true, maxAge: 0, path: '/' })
  return { ok: true }
})

