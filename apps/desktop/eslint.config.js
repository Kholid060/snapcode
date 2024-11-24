import config from '@snippy/eslint-config/vue.js';
import autoImport from './.eslintrc-auto-import.json' with { type: 'json' };

export default [
  {
    ignores: ['src-tauri/**/*', '**/*.d.ts'],
  },
  ...config,
  {
    languageOptions: {
      globals: autoImport.globals,
    },
  },
];
