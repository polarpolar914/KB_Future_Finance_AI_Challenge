import type { Module } from 'vuex'

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
}

const auth: Module<AuthState, any> = {
  namespaced: true,
  state: () => ({
    isAuthenticated: false,
    email: null
  }),
  mutations: {
    setAuthenticated(state, value: boolean) {
      state.isAuthenticated = value
    },
    setEmail(state, email: string | null) {
      state.email = email
    }
  },
  actions: {
    load({ commit }) {
      if (process.client) {
        const email = localStorage.getItem('demo-auth-email')
        if (email) {
          commit('setAuthenticated', true)
          commit('setEmail', email)
        }
      }
    },
    async login({ commit }, { email, password }: { email: string; password: string }) {
      if (process.client) {
        const users = JSON.parse(localStorage.getItem('demo-users') || '{}')
        if (!users[email] || users[email].password !== password) {
          throw { statusMessage: 'Invalid email or password' }
        }
        commit('setAuthenticated', true)
        commit('setEmail', email)
        localStorage.setItem('demo-auth-email', email)
      }
    },
    async register(
      { commit },
      { email, password, name }: { email: string; password: string; name?: string }
    ) {
      if (process.client) {
        const users = JSON.parse(localStorage.getItem('demo-users') || '{}')
        if (users[email]) {
          throw { statusMessage: 'Email already in use' }
        }
        users[email] = { password, name }
        localStorage.setItem('demo-users', JSON.stringify(users))
        commit('setAuthenticated', true)
        commit('setEmail', email)
        localStorage.setItem('demo-auth-email', email)
      }
    },
    async requestOtp({ commit }, email: string) {
      commit('setEmail', email)
    },
    async verifyOtp({ commit }, _code: string) {
      commit('setAuthenticated', true)
    },
    async logout({ commit }) {
      commit('setAuthenticated', false)
      commit('setEmail', null)
      if (process.client) {
        localStorage.removeItem('demo-auth-email')
      }
    }
  }
}

export default auth
