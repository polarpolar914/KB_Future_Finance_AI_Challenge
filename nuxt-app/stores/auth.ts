import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#imports'

type AuthState = {
  isAuthenticated: boolean;
  email: string | null;
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    email: null,
  }),
  actions: {
    async login(email: string, password: string) {
      const config = useRuntimeConfig()
      await $fetch('/api/auth/password/login', {
        baseURL: config.apiBase,
        method: 'POST',
        body: { email, password },
        credentials: 'include',
      })
      this.isAuthenticated = true
      this.email = email
    },
    async register(email: string, password: string, name?: string) {
      const config = useRuntimeConfig()
      await $fetch('/api/auth/password/register', {
        baseURL: config.apiBase,
        method: 'POST',
        body: { email, password, name },
        credentials: 'include',
      })
      await this.login(email, password)
    },
    async requestOtp(email: string) {
      const config = useRuntimeConfig()
      await $fetch('/api/auth/otp/request', {
        baseURL: config.apiBase,
        method: 'POST',
        body: { email },
      })
      this.email = email
    },
    async verifyOtp(code: string, name?: string) {
      const config = useRuntimeConfig()
      await $fetch('/api/auth/otp/verify', {
        baseURL: config.apiBase,
        method: 'POST',
        body: { email: this.email, code, name },
      })
      this.isAuthenticated = true
    },
    async logout() {
      const config = useRuntimeConfig()
      await $fetch('/api/auth/logout', {
        baseURL: config.apiBase,
        method: 'POST',
      })
      this.isAuthenticated = false
      this.email = null
    },
  },
})
