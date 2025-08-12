import { createPinia, setActivePinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia()
  nuxtApp.vueApp.use(pinia)
  setActivePinia(pinia)
  // expose to ensure stores work in middleware and other non-component contexts
  // @ts-expect-error pinia is not typed on NuxtApp
  nuxtApp.pinia = pinia
})
