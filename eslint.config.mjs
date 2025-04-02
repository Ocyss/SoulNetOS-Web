// @ts-check
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu(
    {
      formatters: {
        css: true,
        markdown: 'prettier',
      },
      jsx: true,
      rules: {
        'no-console': 'off',
        'symbol-description': 'off',
      },
      ignores: ['app/types/openapi.d.ts'],
    },
  ),
)
