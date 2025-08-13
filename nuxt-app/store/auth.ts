import type { Module } from 'vuex'
import { $fetch } from 'ofetch'

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  role: string | null;
}

interface User {
  email: string
  roles?: string[]
}

interface LoginResponse {
  access: string
  refresh: string
  roles?: string[]
}

const auth: Module<AuthState, any> = {
  namespaced: true,
  state: () => ({
    isAuthenticated: false,
    email: null,
    role: null,
  }),
  mutations: {
    setAuthenticated(state, value: boolean) {
      state.isAuthenticated = value
    },
    setEmail(state, email: string | null) {
      state.email = email
    },
    setRole(state, role: string | null) {
      state.role = role
    },
  },
  actions: {
    async load({ commit }) {
      if (process.client) {
        const token = localStorage.getItem('access_token')
        if (token) {
          try {
            const user: User = await $fetch('/api/auth/user', {
              headers: { Authorization: `Bearer ${token}` },
            })
            commit('setAuthenticated', true)
            commit('setEmail', user.email)
            commit('setRole', user.roles?.[0] || null)
          } catch {
            localStorage.removeItem('access_token')
          }
        }
      }
    },
    async login({ commit }, { email, password }: { email: string; password: string }) {
      if (process.client) {
        const data: LoginResponse = await $fetch('/api/auth/password/login', {
          method: 'POST',
          body: { email, password },
          credentials: 'include',
        })
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        commit('setAuthenticated', true)
        commit('setEmail', email)
        commit('setRole', data.roles?.[0] || null)
      }
    },
    async register({ dispatch }, { email, password, name }: { email: string; password: string; name?: string }) {
      if (process.client) {
        await $fetch('/api/auth/password/register', {
          method: 'POST',
          body: { email, password, name },
        })
        await dispatch('login', { email, password })
      }
    },
    async logout({ commit }) {
      commit('setAuthenticated', false)
      commit('setEmail', null)
      commit('setRole', null)
      if (process.client) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    },
  },
}

export default auth
