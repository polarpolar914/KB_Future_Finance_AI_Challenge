export default defineNuxtRouteMiddleware((to) => {
  const required = (to.meta.roles as string[]) || []
  if (!required.length) return
  const auth = useAuth()
  if (!auth.loggedIn.value) {
    return navigateTo('/login')
  }
  const roles = auth.user.value?.roles || []
  if (required.length && !required.some((r) => roles.includes(r))) {
    return navigateTo('/')
  }
})
