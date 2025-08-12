import { getQuery, createError } from 'h3'
import { generateNonce } from '../../utils/auth'

export default defineEventHandler((event) => {
  const { address } = getQuery(event)
  if (!address || typeof address !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'address required' })
  }
  const nonce = generateNonce(address)
  return { nonce }
})

