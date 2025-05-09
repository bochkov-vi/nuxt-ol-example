// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['nuxt-quasar-ui', '@nuxt/eslint', '@pinia/nuxt'],
  devtools: { enabled: true },
  compatibilityDate: '2024-11-01',
  srcDir: './src'
})
