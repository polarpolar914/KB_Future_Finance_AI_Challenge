import { readBody } from 'h3'
import { authGuard } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await authGuard(event, ['buyer', 'admin'])
  const body = await readBody(event)
  const { deal_id, reason } = body
  // In real implementation we'd verify participation and trigger workflow
  return { status: 'requested', deal_id, reason }
})
