import { computed } from 'vue'
import { useStore } from 'vuex'

export const useAuth = () => {
  const store = useStore()

  const loggedIn = computed(() => store.state.auth.isAuthenticated)
  const user = computed(() => {
    if (!store.state.auth.isAuthenticated) {
      return null
    }
    return {
      email: store.state.auth.email as string,
      roles: store.state.auth.role ? [store.state.auth.role] : []
    }
  })

  const loginWith = async (_strategy: string, { data }: { data: { email: string; password: string } }) => {
    await store.dispatch('auth/login', data)
  }

  const logout = async () => {
    await store.dispatch('auth/logout')
  }

  return {
    loggedIn,
    user,
    loginWith,
    logout
  }
}
