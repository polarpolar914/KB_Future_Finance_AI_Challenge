import { defineStore } from 'pinia';

type AuthState = {
  token: string | null;
  email: string | null;
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: process.client ? localStorage.getItem('token') : null,
    email: null,
  }),
  actions: {
    async requestOtp(email: string) {
      await $fetch('/api/auth/otp/request', { method: 'POST', body: { email } })
      this.email = email
    },
    async verifyOtp(code: string, name?: string) {
      const res = await $fetch<{ access: string; refresh: string }>('/api/auth/otp/verify', {
        method: 'POST',
        body: { email: this.email, code, name },
      })
      this.token = res.access
      if (process.client) {
        localStorage.setItem('token', res.access)
      }
    },
    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.token = null
      this.email = null
      if (process.client) {
        localStorage.removeItem('token')
      }
    },
  },
})
