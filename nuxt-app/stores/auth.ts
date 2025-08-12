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
    async login(email: string, password: string) {
      const users = JSON.parse(localStorage.getItem('demo-users') || '{}')
      if (!users[email] || users[email].password !== password) {
        throw { statusMessage: 'Invalid email or password' }
      }
      this.isAuthenticated = true
      this.email = email
    },
    async register(email: string, password: string, name?: string) {
      const users = JSON.parse(localStorage.getItem('demo-users') || '{}')
      if (users[email]) {
        throw { statusMessage: 'Email already in use' }
      }
      users[email] = { password, name }
      localStorage.setItem('demo-users', JSON.stringify(users))
      this.isAuthenticated = true
      this.email = email
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
    },
  },
})
