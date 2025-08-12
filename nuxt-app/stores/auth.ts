import { defineStore } from 'pinia'

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
    load() {
      if (process.client) {
        const email = localStorage.getItem('demo-auth-email')
        if (email) {
          this.isAuthenticated = true
          this.email = email
        }
      }
    },
    async login(email: string, password: string) {
      if (process.client) {
        const users = JSON.parse(localStorage.getItem('demo-users') || '{}')
        if (!users[email] || users[email].password !== password) {
          throw { statusMessage: 'Invalid email or password' }
        }
        this.isAuthenticated = true
        this.email = email
        localStorage.setItem('demo-auth-email', email)
      }
    },
    async register(email: string, password: string, name?: string) {
      if (process.client) {
        const users = JSON.parse(localStorage.getItem('demo-users') || '{}')
        if (users[email]) {
          throw { statusMessage: 'Email already in use' }
        }
        users[email] = { password, name }
        localStorage.setItem('demo-users', JSON.stringify(users))
        this.isAuthenticated = true
        this.email = email
        localStorage.setItem('demo-auth-email', email)
      }
    },
    async requestOtp(email: string) {
      this.email = email
    },
    async verifyOtp(code: string, name?: string) {
      this.isAuthenticated = true
    },
    async logout() {
      this.isAuthenticated = false
      this.email = null
      if (process.client) {
        localStorage.removeItem('demo-auth-email')
      }
    },
  },
})
