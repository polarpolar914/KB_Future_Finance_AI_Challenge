import { createStore } from 'vuex'
import auth from '~/store/auth'
import risk from '~/store/risk'

export default defineNuxtPlugin(async (nuxtApp) => {
  const store = createStore({
    modules: {
      auth,
      risk
    }
  })
  nuxtApp.vueApp.use(store)
  if (process.client) {
    await store.dispatch('auth/load')
  }
})
