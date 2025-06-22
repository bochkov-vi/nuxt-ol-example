// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['nuxt-quasar-ui', '@nuxt/eslint', '@pinia/nuxt','pinia-plugin-persistedstate/nuxt'],
  devtools: { enabled: true },
  build: {
    transpile: ['@duckdb/node-api']
  },
  compatibilityDate: '2024-11-01',
  srcDir: './src'
})
