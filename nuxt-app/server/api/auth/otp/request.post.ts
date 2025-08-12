import { readBody, createError } from 'h3'
import { generateOtp } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = body.email as string
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email required' })
  }
  const code = generateOtp(email)
  console.log(`OTP for ${email}: ${code}`)
  return { ok: true }
})
