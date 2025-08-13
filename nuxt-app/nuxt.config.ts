// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/tailwind.css'],
  modules: ['@nuxtjs/axios', '@nuxtjs/auth-next', '@vee-validate/nuxt'],
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001'
    }
  },
  axios: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
    credentials: true
  },
  auth: {
    redirect: {
      login: '/login',
      logout: '/login',
      home: '/'
    },
    strategies: {
      local: {
        token: {
          required: false,
          type: false
        },
        endpoints: {
          login: { url: '/api/auth/password/login', method: 'post' },
          logout: { url: '/api/auth/logout', method: 'post' },
          user: { url: '/api/auth/user', method: 'get' }
        }
      }
    }
  },
  router: {
    middleware: ['auth']
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  nitro: {
    routeRules: {
      // ensure built assets are served statically to avoid router warnings
      '/_nuxt/**': { static: true }
    }
  },
  vite: {
    server: {
      host: true,
      allowedHosts: ['kbai.dongwoo.dev']
    }
  }
})
