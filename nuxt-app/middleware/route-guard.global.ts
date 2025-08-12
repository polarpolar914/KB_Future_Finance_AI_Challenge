import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const required = (to.meta.roles as string[]) || []
  if (!required.length) return
  const auth = useAuthStore()
  const token = auth.token
  if (!token) {
    return navigateTo('/login')
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const ok = required.some((r) => payload.roles?.includes(r))
    if (!ok) {
      return navigateTo('/login')
    }
  } catch {
    return navigateTo('/login')
  }
})
