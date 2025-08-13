export default defineNuxtRouteMiddleware((to) => {
  const required = (to.meta.roles as string[]) || []
  if (!required.length) return
  const auth = useAuth()
  if (!auth.loggedIn) {
    return navigateTo('/login')
  }
  const roles: string[] = (auth.user as any)?.roles || []
  if (required.length && !required.some((r) => roles.includes(r))) {
    return navigateTo('/')
  }
})
