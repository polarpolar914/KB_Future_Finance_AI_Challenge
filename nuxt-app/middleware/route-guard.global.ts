import { useStore } from 'vuex'

export default defineNuxtRouteMiddleware((to) => {
  const required = (to.meta.roles as string[]) || []
  if (!required.length) return
  const store = useStore()
  if (!store.state.auth.isAuthenticated) {
    return navigateTo('/login')
  }
})
