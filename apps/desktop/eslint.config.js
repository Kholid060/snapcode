import config from '@snippy/eslint-config/vue.js';
import autoImport from './.eslintrc-auto-import.json' with { type: 'json' };

export default [
  {
    ignores: ['**/*.{svg, d.ts}', 'src-tauri/**/*', '**/*.d.ts', 'dist/**/*'],
  },
  ...config,
  {
    languageOptions: {
      globals: autoImport.globals,
    },
  },
];
