import { defineStore } from 'pinia';

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
      await $fetch('/api/auth/password/login', {
        method: 'POST',
        body: { email, password },
      })
      this.isAuthenticated = true
      this.email = email
    },
    async register(email: string, password: string, name?: string) {
      await $fetch('/api/auth/password/register', {
        method: 'POST',
        body: { email, password, name },
      })
      await this.login(email, password)
    },
    async requestOtp(email: string) {
      await $fetch('/api/auth/otp/request', { method: 'POST', body: { email } })
      this.email = email
    },
    async verifyOtp(code: string, name?: string) {
      await $fetch('/api/auth/otp/verify', {
        method: 'POST',
        body: { email: this.email, code, name },
      })
      this.isAuthenticated = true
    },
    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.isAuthenticated = false
      this.email = null
    },
  },
})
