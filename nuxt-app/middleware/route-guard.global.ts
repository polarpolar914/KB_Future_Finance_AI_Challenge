import { useStore } from 'vuex'

export default defineNuxtRouteMiddleware((to) => {
  const required = (to.meta.roles as string[]) || []
  if (!required.length) return
  const store = useStore()
  const { isAuthenticated, role } = store.state.auth
  if (!isAuthenticated) {
    return navigateTo('/login')
  }
  if (role && !required.includes(role)) {
    return navigateTo('/')
  }
})
