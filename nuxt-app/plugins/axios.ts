import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const apiClient = axios.create({ baseURL: config.public.apiBase })
  return {
    provide: {
      axios: apiClient
    }
  }
})
