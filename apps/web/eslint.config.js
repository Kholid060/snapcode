import withNuxt from './.nuxt/eslint.config.mjs'
import baseConfg from '@snippy/eslint-config/base.js'

export default withNuxt(
  ...baseConfg,
  {
    rules: {
      'vue/require-default-prop': 'off',
      'vue/no-multiple-template-root': 'off',
      'tailwindcss/no-custom-classname': 'off',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  }
)
