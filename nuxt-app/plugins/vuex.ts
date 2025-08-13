import { createStore } from 'vuex'
import auth from '~/store/auth'
import risk from '~/store/risk'

export default defineNuxtPlugin((nuxtApp) => {
  const store = createStore({
    modules: {
      auth,
      risk
    }
  })
  nuxtApp.vueApp.use(store)
})
