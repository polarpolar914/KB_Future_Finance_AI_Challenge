import type { Module } from 'vuex'

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  role: string | null;
}

const auth: Module<AuthState, any> = {
  namespaced: true,
  state: () => ({
    isAuthenticated: false,
    email: null,
    role: null
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
    }
  },
  actions: {
    load({ commit }) {
      if (process.client) {
        const users = JSON.parse(localStorage.getItem('demo-users') || '{}')
        if (!Object.keys(users).length) {
          const defaults = {
            'buyer@demo.com': {
              password: 'passtest1',
              name: 'Demo Buyer',
              role: 'buyer'
            },
            'seller@demo.com': {
              password: 'passtest1',
              name: 'Demo Seller',
              role: 'seller'
            },
            'guarantor@demo.com': {
              password: 'passtest1',
              name: 'Demo Guarantor',
              role: 'guarantor'
            },
            'insurer@demo.com': {
              password: 'passtest1',
              name: 'Demo Insurer',
              role: 'insurer'
            },
            'admin@demo.com': {
              password: 'passtest1',
              name: 'Demo Admin',
              role: 'admin'
            }
          }
          localStorage.setItem('demo-users', JSON.stringify(defaults))
        }
        const email = localStorage.getItem('demo-auth-email')
        if (email) {
          const u = JSON.parse(localStorage.getItem('demo-users') || '{}')[email]
          commit('setAuthenticated', true)
          commit('setEmail', email)
          commit('setRole', u?.role || null)
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
        commit('setRole', users[email].role || null)
        localStorage.setItem('demo-auth-email', email)
      }
    },
    async register(
      { commit },
      { email, password, name, role = 'buyer' }: { email: string; password: string; name?: string; role?: string }
    ) {
      if (process.client) {
        const users = JSON.parse(localStorage.getItem('demo-users') || '{}')
        if (users[email]) {
          throw { statusMessage: 'Email already in use' }
        }
        users[email] = { password, name, role }
        localStorage.setItem('demo-users', JSON.stringify(users))
        commit('setAuthenticated', true)
        commit('setEmail', email)
        commit('setRole', role)
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
      commit('setRole', null)
      if (process.client) {
        localStorage.removeItem('demo-auth-email')
      }
    }
  }
}

export default auth
