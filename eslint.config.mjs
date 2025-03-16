// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    rules: { 'no-console': 'off', 'vue/multi-word-component-names': 'off' }
  }
)
