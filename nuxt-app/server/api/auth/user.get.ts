import { createError } from 'h3'
import { authGuard, getUserWithRoles } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await authGuard(event)
  const id = event.context.user?.id
  const data = getUserWithRoles(id)
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }
  return { id: data.user.id, email: data.user.email, roles: data.roles }
})
