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
    async login(email: string, password: string) {
      const res = await $fetch<{ access: string }>('/api/auth/password/login', {
        method: 'POST',
        body: { email, password },
      })
      this.token = res.access
      this.email = email
      if (process.client) {
        localStorage.setItem('token', res.access)
      }
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
      const res = await $fetch<{ access: string }>('/api/auth/otp/verify', {
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
