import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const apiClient = axios.create({ baseURL: config.public.apiBase })

  // Attach the access token stored in localStorage to every request so that the
  // backend can authenticate the user via the Authorization header.
  apiClient.interceptors.request.use((cfg) => {
    if (process.client) {
      const token = localStorage.getItem('access_token')
      if (token) {
        cfg.headers = cfg.headers || {}
        cfg.headers.Authorization = `Bearer ${token}`
      }
    }
    return cfg
  })

  return {
    provide: {
      axios: apiClient,
    },
  }
})
