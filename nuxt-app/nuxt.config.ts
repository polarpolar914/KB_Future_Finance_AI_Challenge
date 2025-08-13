// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/tailwind.css'],
  modules: [
    '@vee-validate/nuxt'
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001'
    }
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

